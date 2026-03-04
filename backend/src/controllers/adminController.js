import mongoose from "mongoose";
import { Car, Reservation, User, BlockedPeriod } from "../models/index.js";

// Statistiques du dashboard
export async function getDashboardStats(req, res, next) {
  try {
    // Stats réservations par statut
    const reservationsByStatus = await Reservation.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Réservations qui commencent aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPickups = await Reservation.countDocuments({
      startDate: { $gte: today, $lt: tomorrow },
    });

    const todayReturns = await Reservation.countDocuments({
      endDate: { $gte: today, $lt: tomorrow },
    });

    // Stats utilisateurs
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ hasPassword: true });
    const guestUsers = await User.countDocuments({ hasPassword: false });

    // Stats voitures
    const totalCars = await Car.countDocuments();
    const availableCars = await Car.countDocuments({ status: "DISPONIBLE" });

    // Dernières réservations (10 dernières)
    const recentReservations = await Reservation.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "firstName lastName email")
      .populate("car", "brand model licensePlate");

    res.json({
      data: {
        reservations: {
          byStatus: reservationsByStatus,
          todayPickups,
          todayReturns,
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          guests: guestUsers,
        },
        cars: {
          total: totalCars,
          available: availableCars,
        },
        recent: recentReservations,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Lister toutes les réservations avec filtres
export async function getAllReservations(req, res, next) {
  try {
    const { status, startDate, endDate } = req.query;
    
    const filters = {};
    if (status) {
      filters.status = status;
    }
    if (startDate) {
      filters.startDate = { $gte: new Date(startDate) };
    }
    if (endDate) {
      filters.endDate = { $lte: new Date(endDate) };
    }

    const reservations = await Reservation.find(filters)
      .sort({ createdAt: -1 })
      .populate("user", "firstName lastName email phone licenseNumber")
      .populate("car", "brand model category licensePlate pricePerDay");

    res.json({ data: reservations });
  } catch (error) {
    next(error);
  }
}

// Mettre à jour le statut d'une réservation
export async function updateReservationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid reservation ID");
      err.status = 400;
      throw err;
    }

    const validStatuses = ["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      const err = new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
      err.status = 400;
      throw err;
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      const err = new Error("Reservation not found");
      err.status = 404;
      throw err;
    }

    reservation.status = status;
    if (notes) {
      reservation.notes = notes;
    }
    await reservation.save();

    // Si confirmé, mettre à jour le statut de la voiture
    if (status === "CONFIRMED") {
      await Car.findByIdAndUpdate(reservation.car, { status: "RESERVATION" });
    } else if (status === "CANCELLED" || status === "COMPLETED") {
      await Car.findByIdAndUpdate(reservation.car, { status: "DISPONIBLE" });
    }

    const updated = await Reservation.findById(id)
      .populate("user", "firstName lastName email")
      .populate("car", "brand model licensePlate");

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
}

// Lister tous les utilisateurs
export async function getAllUsers(req, res, next) {
  try {
    const { hasPassword, isActive } = req.query;
    
    const filters = {};
    if (hasPassword !== undefined) {
      filters.hasPassword = hasPassword === "true";
    }
    if (isActive !== undefined) {
      filters.isActive = isActive === "true";
    }

    const users = await User.find(filters)
      .select("-password")
      .sort({ createdAt: -1 })
      .populate("reservations");

    res.json({ data: users });
  } catch (error) {
    next(error);
  }
}

// Lister toutes les voitures (admin)
export async function getAllCars(req, res, next) {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json({ data: cars });
  } catch (error) {
    next(error);
  }
}

// Mettre à jour une voiture (admin)
export async function updateCar(req, res, next) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid car ID");
      err.status = 400;
      throw err;
    }

    const allowedFields = [
      "pricePerDay",
      "description",
      "status",
      "seats",
      "luggage",
      "transmission",
      "fuel",
      "imageUrl",
      "category",
      "year",
      "brand",
      "model",
      "licensePlate",
    ];

    for (const key of Object.keys(updates)) {
      if (!allowedFields.includes(key)) {
        delete updates[key];
      }
    }

    if (updates.pricePerDay !== undefined) {
      updates.pricePerDay = Number(updates.pricePerDay);
      if (!Number.isFinite(updates.pricePerDay) || updates.pricePerDay <= 0) {
        const err = new Error("pricePerDay must be a positive number");
        err.status = 400;
        throw err;
      }
    }

    if (updates.seats !== undefined) {
      updates.seats = Number(updates.seats);
      if (!Number.isInteger(updates.seats) || updates.seats <= 0) {
        const err = new Error("seats must be a positive integer");
        err.status = 400;
        throw err;
      }
    }

    if (updates.luggage !== undefined) {
      updates.luggage = Number(updates.luggage);
      if (!Number.isInteger(updates.luggage) || updates.luggage < 0) {
        const err = new Error("luggage must be a non-negative integer");
        err.status = 400;
        throw err;
      }
    }

    if (updates.year !== undefined) {
      updates.year = Number(updates.year);
      if (!Number.isInteger(updates.year) || updates.year < 1990) {
        const err = new Error("year must be a valid integer");
        err.status = 400;
        throw err;
      }
    }

    const car = await Car.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!car) {
      const err = new Error("Car not found");
      err.status = 404;
      throw err;
    }

    res.json({ data: car });
  } catch (error) {
    next(error);
  }
}

// Mettre à jour un utilisateur
export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid user ID");
      err.status = 400;
      throw err;
    }

    // Ne pas permettre de modifier le mot de passe ici
    delete updates.password;
    delete updates.email; // L'email ne peut pas être changé non plus

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select(
      "-password"
    );

    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
}

// Récupérer toutes les périodes bloquées d'une voiture
export async function getBlockedPeriods(req, res, next) {
  try {
    const { carId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      const err = new Error("Invalid car ID");
      err.status = 400;
      throw err;
    }

    const blockedPeriods = await BlockedPeriod.find({ car: carId }).sort({ startDate: 1 });
    res.json({ data: blockedPeriods });
  } catch (error) {
    next(error);
  }
}

// Créer une nouvelle période bloquée
export async function createBlockedPeriod(req, res, next) {
  try {
    const { carId } = req.params;
    const { startDate, endDate, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      const err = new Error("Invalid car ID");
      err.status = 400;
      throw err;
    }

    if (!startDate || !endDate) {
      const err = new Error("startDate and endDate are required");
      err.status = 400;
      throw err;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      const err = new Error("endDate must be after startDate");
      err.status = 400;
      throw err;
    }

    // Vérifier qu'il n'y a pas de réservations confirmées sur cette période
    const conflictingReservation = await Reservation.findOne({
      car: carId,
      status: { $in: ["CONFIRMED", "ACTIVE"] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (conflictingReservation) {
      const err = new Error("Cannot block period: there is a confirmed reservation during this time");
      err.status = 409;
      throw err;
    }

    const blockedPeriod = await BlockedPeriod.create({
      car: carId,
      startDate: start,
      endDate: end,
      reason: reason || "Indisponibilité temporaire",
    });

    res.status(201).json({ data: blockedPeriod });
  } catch (error) {
    next(error);
  }
}

// Supprimer une période bloquée
export async function deleteBlockedPeriod(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid blocked period ID");
      err.status = 400;
      throw err;
    }

    const blockedPeriod = await BlockedPeriod.findByIdAndDelete(id);

    if (!blockedPeriod) {
      const err = new Error("Blocked period not found");
      err.status = 404;
      throw err;
    }

    res.json({ data: { message: "Blocked period deleted successfully" } });
  } catch (error) {
    next(error);
  }
}
