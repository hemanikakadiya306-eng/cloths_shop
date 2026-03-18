
import { Link } from "react-router-dom";

function Categories(){

return(

<div className="categories">

<h2>SHOP BY CATEGORY</h2>

<div className="category-grid">

<Link to="/shop?category=men" className="category-card">
<img src="/images/men.jpg" alt="men"/>
<p>MEN</p>
</Link>

<Link to="/shop?category=women" className="category-card">
<img src="/images/women.jpg" alt="women"/>
<p>WOMEN</p>
</Link>

<Link to="/shop?category=kids" className="category-card">
<img src="/images/kids.jpg" alt="kids"/>
<p>KIDS</p>
</Link>

<Link to="/shop?category=unisex" className="category-card">
<img src="/images/unisex.jpg" alt="unisex"/>
<p>UNISEX</p>
</Link>

</div>

</div>

)

}

export default Categories;