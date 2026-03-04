import mongoose from "mongoose";
import { Car, Reservation, User } from "../models/index.js";

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
