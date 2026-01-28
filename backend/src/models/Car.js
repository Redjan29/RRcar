import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    fleeteeId: {
      type: String,
      // ID de la voiture dans Fleetee (à remplir après intégration)
    },
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["CITADINE", "BREAK", "BERLINE", "SUV", "LUXE"],
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    licensePlate: {
      type: String,
      required: true,
      unique: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
    },
    seats: {
      type: Number,
      required: true,
    },
    luggage: {
      type: Number,
      required: true,
    },
    transmission: {
      type: String,
      enum: ["Manuel", "Auto"],
      required: true,
    },
    fuel: {
      type: String,
      enum: ["Essence", "Diesel", "Électrique", "Hybride"],
      required: true,
    },
    imageUrl: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["DISPONIBLE", "RESERVATION", "MAINTENANCE", "INDISPONIBLE"],
      default: "DISPONIBLE",
    },
    mileage: {
      type: Number,
      default: 0,
    },
    lastMaintenance: {
      type: Date,
    },
    reservations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation",
      },
    ],
  },
  { timestamps: true }
);

export const Car = mongoose.model("Car", carSchema);
