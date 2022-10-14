import PropTypes from "prop-types";
import Wallet from "../Wallet";
import { Nav, Button } from "react-bootstrap";
import chef from "../../assets/img/chef.png";
import arrowdown from "../../assets/img/arrow-down.png";

const Header = ({ address, name, balance, disconnect }) => {
  return (
    <header>
      <div className="view landing">
        <div id="overlay">
          <Nav className="navbar justify-content-between nav-fill pt-3 navbar-expand-sm bg-success">
            <Nav.Item>
              <a
                className="navbar-brand"
                href="#overlay"
                style={{ fontFamily: "Kalam, cursive", fontSize: "30px" }}
              >
                <span className="pi">PI</span>
                <span className="zz">ZZ</span>A<span className="pap">PAP</span>
              </a>
            </Nav.Item>
            <Nav.Item>
              <a className="nav-link" href="#variety">
                Varieties
              </a>
            </Nav.Item>
            <Nav.Item>
              <a className="nav-link" href="#make-order">
                Order
              </a>
            </Nav.Item>
            <Nav.Item>
              <a className="nav-link" href="#contact">
                Contact Us
              </a>
            </Nav.Item>
            <Nav.Item>
              <Wallet
                address={address}
                name={name}
                amount={balance}
                disconnect={disconnect}
                symbol={"ALGO"}
              />
            </Nav.Item>
          </Nav>

          {/* <!-- landing page section --> */}
          <div className="mask rgba-black-light align-items-center">
            <div className="container" id="head">
              <div className="row">
                <div className="col-md-12 mb-4 white-text text-center text">
                  <h1 className="h1-reponsive" style={{ fontSize: "70px" }}>
                    <strong>
                      <span className="pi">Pi</span>
                      <span className="zz">zz</span>a
                      <span className="pap">Pap</span>
                    </strong>
                  </h1>
                  <h5 className="text-uppercase mb-4 gold-text">
                    <strong>Best Pizza Shop in Town!</strong>
                  </h5>
                  <a
                    className="btn floater"
                    variant="success"
                    href="#make-order"
                  >
                    <Button variant="success" size="lg">
                      Order Now!
                    </Button>
                  </a>
                </div>
              </div>
            </div>
            {/* <!-- welcoming image and arrow --> */}
            <div className="d-flex flex-column">
              <img
                src={chef}
                className="welcomee"
                alt=""
                height="250px"
                width="200px"
              />
              <a href="#variety">
                <img className="bounce arrow floater" src={arrowdown} alt="" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  address: PropTypes.string.isRequired,
  name: PropTypes.string,
  balance: PropTypes.number.isRequired,
  disconnect: PropTypes.func.isRequired,
};

export default Header;
