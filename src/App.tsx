import "./index.css";

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>ROYA JEWELS</h1>
        <p>Elegant Jewellery for Every Occasion</p>
      </header>

      <main>
        <h2>Featured Collection</h2>

        <div className="products">
          <div className="product">
            <img
              src="/src/assets/images/roya_cascade_neck_178726906700.jpg"
              alt="Jewellery"
            />
            <h3>Elegant Necklace</h3>
            <p>₹2,999</p>
          </div>
        </div>
      </main>
    </div>
  );
}
