import mongoose from "mongoose";
import { Car } from "../models/index.js";

function mapCar(carDoc) {
  const car = carDoc.toObject({ getters: true });
  return { id: car._id.toString(), ...car, _id: undefined };
}

export async function getCars(req, res, next) {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json({ data: cars.map(mapCar) });
  } catch (error) {
    next(error);
  }
}

export async function getAvailableCars(req, res, next) {
  try {
    const cars = await Car.find({ status: "DISPONIBLE" }).sort({ createdAt: -1 });
    res.json({ data: cars.map(mapCar) });
  } catch (error) {
    next(error);
  }
}

export async function getCarById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid car id");
      err.status = 400;
      throw err;
    }

    const car = await Car.findById(id);
    if (!car) {
      const err = new Error("Car not found");
      err.status = 404;
      throw err;
    }

    res.json({ data: mapCar(car) });
  } catch (error) {
    next(error);
  }
}

export async function seedCars(req, res, next) {
  try {
    const existing = await Car.countDocuments();
    if (existing > 0) {
      return res.json({ data: { inserted: 0, message: "Cars already exist" } });
    }

    const cars = [
      {
        brand: "Peugeot",
        model: "308 SW",
        category: "BREAK",
        year: 2022,
        licensePlate: "AA-308-SW",
        pricePerDay: 39,
        seats: 5,
        luggage: 3,
        transmission: "Auto",
        fuel: "Essence",
        imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
        description:
          "Parfaite pour les déplacements à Paris, confortable et économique, idéale pour les familles et les longs trajets.",
      },
      {
        brand: "Peugeot",
        model: "508",
        category: "BERLINE",
        year: 2021,
        licensePlate: "BB-508-PA",
        pricePerDay: 49,
        seats: 5,
        luggage: 3,
        transmission: "Auto",
        fuel: "Diesel",
        imageUrl: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80",
        description:
          "Berline élégante idéale pour les trajets confortables dans Paris et en Île-de-France.",
      },
      {
        brand: "Nissan",
        model: "Micra Black",
        category: "CITADINE",
        year: 2020,
        licensePlate: "CC-111-MB",
        pricePerDay: 36,
        seats: 5,
        luggage: 2,
        transmission: "Manuel",
        fuel: "Essence",
        imageUrl: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80",
        description:
          "Micra noire compacte, parfaite pour circuler et se garer facilement dans le centre de Paris.",
      },
    ];

    const created = await Car.insertMany(cars);
    res.json({ data: { inserted: created.length } });
  } catch (error) {
    next(error);
  }
}