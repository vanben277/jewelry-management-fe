import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import BannerCarousel from "../../components/user/Home/BannerCarousel";
import CategoryIcons from "../../components/user/Home/CategoryIcons";
import BrandSliders from "../../components/user/Home/BrandSliders";
import BrandIntro from "../../components/user/Home/BrandIntro";
import ProductCarousel from "../../components/user/Home/ProductCarousel";
import { Link } from "react-router-dom";
import { productApi } from "../../apis";

interface Product {
  id?: number;
  productId?: number;
  displayName?: string;
  name?: string;
  price: number;
  primaryImageUrl?: string;
  images?: { imageUrl: string; isPrimary: boolean }[];
  soldQuantity?: number;
  totalQuantitySold?: number;
}

const Home: React.FC = () => {
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [latestRes, topRes] = await Promise.all([
          productApi.getLatest(),
          productApi.getTopSelling(4),
        ]);
        if (latestRes.data) setLatestProducts(latestRes.data);
        if (topRes.data) setTopSellingProducts(topRes.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        toast.error("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      }
    };
    fetchData();
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "đ";

  return (
    <>
      <BannerCarousel />
      <CategoryIcons />
      <BrandSliders />

      {/* Sản phẩm mới nhất */}
      <div className="grid wide">
        <div id="container" className="container m-16 m-32">
          <div className="content__title">
            <h2>Sản phẩm mới nhất</h2>
          </div>
          <ProductCarousel products={latestProducts} />
          <div className="container__more mt-8">
            <div className="container__more--btn mb-16">
              <Link to="/containers">Xem thêm</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sản phẩm bán chạy */}
      <div className="grid wide">
        <div id="container__newitem" className="container__newitem m-16 m-32">
          <div className="content__title content__title--center">
            <h2>Sản phẩm bán chạy</h2>
          </div>
          <div className="row">
            {topSellingProducts.map((p) => {
              const primary =
                p.images?.find((img) => img.isPrimary)?.imageUrl || "";
              const hover =
                p.images?.find((img) => !img.isPrimary)?.imageUrl || primary;
              return (
                <Link
                  key={p.id}
                  to={`/product-detailed/${p.id}`}
                  className="col l-2-9 m-3-9 c-5-9 container__block__new"
                >
                  <div className="container__blocknew--item">
                    <div className="container__img">
                      <img
                        src={primary}
                        className="container__imgnew--w"
                        alt={`Ảnh sản phẩm ${p.name}`}
                        loading="lazy"
                        decoding="async"
                      />
                      <img
                        src={hover}
                        className="container__img--h"
                        alt={`Ảnh hover sản phẩm ${p.name}`}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="container__namenew">
                      <p>{p.name}</p>
                    </div>
                    <div className="container__pricenew">
                      <p>{formatPrice(p.price)}</p>
                    </div>
                    <div className="container__sales">
                      <p>{p.totalQuantitySold} đã bán</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <BrandIntro />
    </>
  );
};

export default Home;
