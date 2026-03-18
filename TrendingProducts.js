import React from "react";
import ProductCard from "./ProductCard";
import "./TrendingProducts.css";

function TrendingProducts({products}){

return(

<div className="trending-section">

<h2>Trending Products</h2>

<div className="trending-grid">

{products.map(p=>(
<ProductCard key={p._id} product={p}/>
))}

</div>

</div>

)

}

export default TrendingProducts;