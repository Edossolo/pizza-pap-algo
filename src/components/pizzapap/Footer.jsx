export const Footer = () => {
  return (
    <footer className="main-footer" id="contact">
      <div className="controls-top">
        <h2>Contact Us</h2>
      </div>
      <div className="d-flex justify-content-between" id="contactdetails">
        <div className="col-md-1"></div>
        <div className="col-md-3 text-justify">
          <h2>Location</h2>
          <p>
            <span className="pi">PI</span>
            <span className="zz">ZZ</span>A<span className="pap">PAP</span>
          </p>
          <p>Obamatt | Kagundo Road</p>
          <p>00325,Embakasi</p>
        </div>
        <div className="col-md-4">
          <div className="mapouter">
            <div className="gmap_canvas">
              <iframe
                title="map"
                width="350"
                height="180"
                id="gmap_canvas"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7977.733831772942!2d36.92257380590624!3d-1.251273627791439!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f14dce76defd1%3A0x4283ea5ba93b0a97!2sNjiru%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1596367923388!5m2!1sen!2ske"
                style={{ border: "0" }}
                allowFullScreen=""
                aria-hidden="false"
                tabIndex="0"
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <a href="#overlay">
          <img
            className="bounce arrowup floater"
            src="https://i.postimg.cc/fLcQzwsN/uppp.png"
            alt=""
          />
        </a>
      </div>
      <div className="row">
        <div className="text-center footer">
          <p className="text-white">&copy; 2022 | Pizza order</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
