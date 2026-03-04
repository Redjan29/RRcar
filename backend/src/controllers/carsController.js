import mongoose from "mongoose";
import { Car } from "../models/index.js";

const seedFleet = [
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
    imageUrl: "/cars/peugeot-308-sw-night.jpeg",
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
    imageUrl: "/cars/peugeot-508.jpeg",
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
    imageUrl: "/cars/nissan-micra-black.jpeg",
    description:
      "Micra noire compacte, parfaite pour circuler et se garer facilement dans le centre de Paris.",
  },
  {
    brand: "Opel",
    model: "Corsa Rouge",
    category: "CITADINE",
    year: 2021,
    licensePlate: "DD-207-CR",
    pricePerDay: 35,
    seats: 5,
    luggage: 2,
    transmission: "Manuel",
    fuel: "Essence",
    imageUrl: "/cars/opel-corsa-red.jpeg",
    description:
      "Corsa rouge dynamique, idéale pour les courts séjours et les déplacements urbains.",
  },
  {
    brand: "Toyota",
    model: "Yaris Rouge",
    category: "CITADINE",
    year: 2022,
    licensePlate: "EE-512-YR",
    pricePerDay: 37,
    seats: 5,
    luggage: 2,
    transmission: "Auto",
    fuel: "Hybride",
    imageUrl: "/cars/toyota-yaris-red.jpeg",
    description:
      "Citadine hybride économique, parfaite pour limiter la consommation en ville.",
  },
  {
    brand: "Nissan",
    model: "Micra White",
    category: "CITADINE",
    year: 2020,
    licensePlate: "FF-309-MW",
    pricePerDay: 36,
    seats: 5,
    luggage: 2,
    transmission: "Manuel",
    fuel: "Essence",
    imageUrl: "/cars/nissan-micra-white.jpeg",
    description:
      "Micra blanche polyvalente, idéale pour les déplacements quotidiens sur Paris.",
  },
  {
    brand: "Opel",
    model: "Corsa Grise",
    category: "CITADINE",
    year: 2021,
    licensePlate: "GG-411-CS",
    pricePerDay: 35,
    seats: 5,
    luggage: 2,
    transmission: "Manuel",
    fuel: "Essence",
    imageUrl: "/cars/opel-corsa-silver.jpeg",
    description:
      "Corsa grise discrète et confortable, pour les séjours courts comme longs.",
  },
  {
    brand: "Skoda",
    model: "Rapid",
    category: "BERLINE",
    year: 2019,
    licensePlate: "HH-620-SR",
    pricePerDay: 45,
    seats: 5,
    luggage: 3,
    transmission: "Manuel",
    fuel: "Diesel",
    imageUrl: "/cars/skoda-rapid-black.jpeg",
    description:
      "Berline spacieuse idéale pour les trajets en groupe ou en famille autour de Paris.",
  },
  {
    brand: "Nissan",
    model: "Primera",
    category: "BERLINE",
    year: 2018,
    licensePlate: "II-287-NP",
    pricePerDay: 42,
    seats: 5,
    luggage: 3,
    transmission: "Manuel",
    fuel: "Essence",
    imageUrl: "/cars/nissan-primera-grey.jpeg",
    description:
      "Berline confortable, parfaite pour les trajets domicile–aéroport ou les week-ends.",
  },
];

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
    const syncResult = await Car.bulkWrite(
      seedFleet.map((car) => ({
        updateOne: {
          filter: { licensePlate: car.licensePlate },
          update: { $set: car },
          upsert: true,
        },
      }))
    );

    res.json({
      data: {
        totalSeeded: seedFleet.length,
        inserted: syncResult.upsertedCount,
        updated: syncResult.modifiedCount,
        matched: syncResult.matchedCount,
      },
    });
  } catch (error) {
    next(error);
  }
}