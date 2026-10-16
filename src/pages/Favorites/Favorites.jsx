import { useContext } from "react";
import { Link } from "react-router-dom";
import { FavoritesContext } from "../../context/FavoritesContext";
import { CartContext } from "../../context/CartContext";
import "./Favorites.css";

const Favorites = () => {
  const { favorites, toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const { addToCart } = useContext(CartContext);

  return (
    <div className="favorites-page">
      <h1>المفضلات ❤️</h1>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <p>لم تضف أي منتج للمفضلات بعد.</p>
          <Link to="/store" className="browse-btn">
            الذهاب للمتجر 🛒
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {favorites.map((product) => {
            const finalPrice =
              product.price - (product.price * (product.discount || 0)) / 100;

            return (
              <div className="card" key={product.id}>
                {/* Heart Icon Toggle */}
                <button
                  className="heart-btn"
                  onClick={() => toggleFavorite(product)}
                >
                  {isFavorite(product.id) ? "❤️" : "🤍"}
                </button>

                <img src={product.image} alt={product.name} />

                <div className="card-body">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>

                  <div className="price-box">
                    {product.discount > 0 && (
                      <span className="old-price">{product.price} EGP</span>
                    )}
                    <div>
                      <span className="new-price">{finalPrice.toFixed(0)} EGP</span>
                      {product.discount > 0 && (
                        <span className="badge">-{product.discount}%</span>
                      )}
                    </div>
                  </div>

                  <button
                    className="add-btn"
                    onClick={() => {
                      addToCart(product);
                    }}
                  >
                    إضافة للسلة
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favorites;
