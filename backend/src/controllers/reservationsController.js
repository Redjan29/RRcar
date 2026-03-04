import mongoose from "mongoose";
import { Car, Reservation, User } from "../models/index.js";

function parseDate(value, label) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const err = new Error(`Invalid ${label}`);
    err.status = 400;
    throw err;
  }
  return date;
}

function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  if (diffMs < 0) {
    const err = new Error("End date must be after start date");
    err.status = 400;
    throw err;
  }
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

export async function createReservation(req, res, next) {
  try {
    const {
      carId,
      user,
      startDate,
      endDate,
      startTime = "09:00",
      endTime = "18:00",
      notes,
    } = req.body;

    if (!carId) {
      const err = new Error("carId is required");
      err.status = 400;
      throw err;
    }

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      const err = new Error("Invalid carId");
      err.status = 400;
      throw err;
    }

    if (!user?.email) {
      const err = new Error("User email is required");
      err.status = 400;
      throw err;
    }

    const requiredUserFields = ["firstName", "lastName", "phone", "licenseNumber", "licenseExpiry"];
    for (const field of requiredUserFields) {
      if (!user?.[field]) {
        const err = new Error(`User ${field} is required`);
        err.status = 400;
        throw err;
      }
    }

    const start = parseDate(startDate, "startDate");
    const end = parseDate(endDate, "endDate");
    const numberOfDays = calculateDays(start, end);

    const car = await Car.findById(carId);
    if (!car) {
      const err = new Error("Car not found");
      err.status = 404;
      throw err;
    }

    const conflicting = await Reservation.findOne({
      car: carId,
      status: { $in: ["PENDING", "CONFIRMED", "ACTIVE"] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (conflicting) {
      const err = new Error("Car not available for selected dates");
      err.status = 409;
      throw err;
    }

    let existingUser = await User.findOne({ email: user.email.toLowerCase() });
    if (!existingUser) {
      existingUser = await User.create({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        licenseNumber: user.licenseNumber,
        licenseExpiry: user.licenseExpiry,
        hasPassword: false,
      });
    }

    const reservation = await Reservation.create({
      user: existingUser._id,
      car: car._id,
      startDate: start,
      endDate: end,
      startTime,
      endTime,
      numberOfDays,
      pricePerDay: car.pricePerDay,
      totalPrice: numberOfDays * car.pricePerDay,
      notes,
    });

    await Car.findByIdAndUpdate(car._id, { $addToSet: { reservations: reservation._id } });
    await User.findByIdAndUpdate(existingUser._id, { $addToSet: { reservations: reservation._id } });

    res.status(201).json({ data: reservation });
  } catch (error) {
    next(error);
  }
}

export async function getReservationById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid reservation id");
      err.status = 400;
      throw err;
    }

    const reservation = await Reservation.findById(id)
      .populate("user", "firstName lastName email phone")
      .populate("car", "brand model category pricePerDay");

    if (!reservation) {
      const err = new Error("Reservation not found");
      err.status = 404;
      throw err;
    }

    res.json({ data: reservation });
  } catch (error) {
    next(error);
  }
}

export async function updateReservation(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid reservation id");
      err.status = 400;
      throw err;
    }

    const reservation = await Reservation.findById(id).populate("car", "pricePerDay");
    if (!reservation) {
      const err = new Error("Reservation not found");
      err.status = 404;
      throw err;
    }

    const updates = { ...req.body };
    if (updates.startDate || updates.endDate) {
      const start = updates.startDate ? parseDate(updates.startDate, "startDate") : reservation.startDate;
      const end = updates.endDate ? parseDate(updates.endDate, "endDate") : reservation.endDate;
      const numberOfDays = calculateDays(start, end);
      updates.startDate = start;
      updates.endDate = end;
      updates.numberOfDays = numberOfDays;
      updates.totalPrice = numberOfDays * reservation.pricePerDay;
    }

    const updated = await Reservation.findByIdAndUpdate(id, updates, { new: true });
    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteReservation(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid reservation id");
      err.status = 400;
      throw err;
    }

    const reservation = await Reservation.findByIdAndDelete(id);
    if (!reservation) {
      const err = new Error("Reservation not found");
      err.status = 404;
      throw err;
    }

    await Car.findByIdAndUpdate(reservation.car, { $pull: { reservations: reservation._id } });
    await User.findByIdAndUpdate(reservation.user, { $pull: { reservations: reservation._id } });

    res.json({ data: { deleted: true } });
  } catch (error) {
    next(error);
  }
}