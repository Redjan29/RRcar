import CarCard from "./components/CarCard";
import { cars } from "./data/cars";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "24px",
          padding: "40px",
          background: "#e5e7eb",
          minHeight: "100vh",
        }}
      >
        {cars.map((car) => (
          <CarCard key={car.id} {...car} />
        ))}
      </div>
    </>
  );
}

export default App;
