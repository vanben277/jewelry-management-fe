import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="footer py-4">
      <div className="container-fluid">
        <div className="row align-items-center justify-content-lg-between">
          <div className="col-lg-6 mb-lg-0 mb-4">
            <div className="copyright text-center text-[16px] text-muted text-lg-start">
              © {new Date().getFullYear()}, Copyright:{" "}
              <i className="fa fa-heart"></i>
              <a href="#" className="font-weight-bold ml-1" target="_blank">
                Văn Ben, Văn Nu
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
