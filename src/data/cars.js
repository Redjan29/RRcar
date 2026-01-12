// src/data/cars.js
import peugeot308 from '../assets/peugeot-308.jpeg';
import corsa from '../assets/opel-corsa.jpeg';

export const cars = [
  {
    id: 'peugeot-308-sw',
    brand: 'Peugeot',
    model: '308 SW',
    category: 'ÉCONOMIQUE',
    pricePerDay: 39,
    imageUrl: peugeot308,
    seats: 5,
    luggage: 3,
    transmission: 'Auto',
    fuel: 'Essence',
    description:
      'Parfaite pour les déplacements à Paris, confortable et économique, idéale pour les familles et les longs trajets.',
  },
  {
    id: 'opel-corsa',
    brand: 'Opel',
    model: 'Corsa',
    category: 'CITADINE',
    pricePerDay: 34,
    imageUrl: corsa,
    seats: 5,
    luggage: 2,
    transmission: 'Manuelle',
    fuel: 'Diesel',
    description:
      'Citadine compacte, idéale pour se garer facilement dans Paris tout en restant confortable.',
  },
];

export function getCarById(id) {
  return cars.find((car) => car.id === id);
}
