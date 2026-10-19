import { useContext } from "react";
import { Link } from "react-router-dom";
import { FavoritesContext } from "../../context/FavoritesContext";
import ProductCard from "../../components/ProductCard/ProductCard";
import "./Favorites.css";

const Favorites = () => {
  const { favorites } = useContext(FavoritesContext);

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
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} isAdmin={false} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
