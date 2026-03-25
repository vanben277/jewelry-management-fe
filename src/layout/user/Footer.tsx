import React from "react";
import Marquee from "react-fast-marquee";
import { FaFacebook, FaGoogle, FaGithub } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io5";

const Footer: React.FC = () => {
  return (
    <>
      <div id="footer">
        <footer className="footer--text m-16 m-32">
          <div className="grid wide">
            {/* Section: Social media */}
            <section className="row no-gutters footer--spacebeetween">
              {/* Left */}
              <div className="">
                <span>Hãy kết nối với chúng tôi trên các mạng xã hội:</span>
              </div>

              {/* Right */}
              <div className="footer-social-icons">
                <a
                  href="https://www.facebook.com/"
                  className="text-reset social-icon facebook"
                >
                  <FaFacebook className="icons" />
                </a>
                <a
                  href="https://www.google.com.vn/?hl=vi"
                  className="text-reset social-icon google"
                >
                  <FaGoogle className="icons" />
                </a>
                <a
                  href="https://www.instagram.com/"
                  className="text-reset social-icon instagram"
                >
                  <IoLogoInstagram className="icons" />
                </a>
                <a
                  href="https://github.com/"
                  className="text-reset social-icon github"
                >
                  <FaGithub className="icons" />
                </a>
              </div>
            </section>

            {/* Section: Links */}
            <section className="">
              <div className="grid wide footer__container">
                <div className="row no-gutters footer__container--block">
                  {/* Column 1: Company Info */}
                  <div className="footer__container--pad col l-3 m-6 c-12">
                    <h6 className="text-uppercase footer-heading">
                      <i className="fas fa-gem"></i>Company
                    </h6>
                    <p>
                      Here you can use rows and columns to organize your footer
                      content. Lorem ipsum dolor sit amet, consectetur
                      adipisicing elit.
                    </p>
                  </div>

                  {/* Column 2: Products */}
                  <div className="footer__container--pad col l-3 m-6 c-12">
                    <h6 className="text-uppercase footer-heading">Products</h6>
                    <p>
                      <a href="#!" className="text-reset footer-link">
                        Angular
                      </a>
                    </p>
                    <p>
                      <a href="#!" className="text-reset footer-link">
                        React
                      </a>
                    </p>
                    <p>
                      <a href="#!" className="text-reset footer-link">
                        Vue
                      </a>
                    </p>
                    <p>
                      <a href="#!" className="text-reset footer-link">
                        Laravel
                      </a>
                    </p>
                  </div>

                  {/* Column 3: Useful links */}
                  <div className="footer__container--pad col l-3 m-6 c-12">
                    <h6 className="text-uppercase footer-heading">
                      Useful links
                    </h6>
                    <p>
                      <a href="#!" className="text-reset footer-link">
                        Pricing
                      </a>
                    </p>
                    <p>
                      <a href="#!" className="text-reset footer-link">
                        Settings
                      </a>
                    </p>
                    <p>
                      <a href="#!" className="text-reset footer-link">
                        Orders
                      </a>
                    </p>
                    <p>
                      <a href="#!" className="text-reset footer-link">
                        Help
                      </a>
                    </p>
                  </div>

                  {/* Column 4: Contact */}
                  <div className="footer__container--pad col l-3 m-6 c-12">
                    <h6 className="text-uppercase footer-heading">Contact</h6>
                    <p className="contact-item">
                      <i className="fas fa-home"></i> Van Duong, Bac Ninh
                    </p>
                    <p className="contact-item">
                      <i className="fas fa-envelope"></i> toducbn@gmail.com
                    </p>
                    <p className="contact-item">
                      <i className="fas fa-phone"></i> + 84 364 298 622
                    </p>
                    <p className="contact-item">
                      <i className="fas fa-print"></i> + 84 364 298 622
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </footer>
      </div>

      {/* Copyright bar */}
      <div className="no-gutters text--center p-4 copyright-bar">
        <Marquee>
          © 2024 Copyright:
          <a className="text-reset fw-bold copyright-link" href="#header">
            Văn Ben, Văn Nu
          </a>
        </Marquee>
      </div>
    </>
  );
};

export default Footer;
