import {NavLink} from "react-router-dom";
import "../pages/styles/navigation.css";

export default function Navigation() {
    return (
        <>
            <div className="container-fluid">
                <div id="navbar-wrapper" className="position-relative">
                    <div className="row align-items-center fw-lighter">
                        <div className="col d-flex justify-content-start">
                            <img id="brand-logo" src="/olympus-logo.svg" alt="Olympus" />
                        </div>

                        <div className="col-auto d-flex justify-content-center gap-4">
                            <NavLink to="/home" className="nav-link-custom">Home</NavLink>
                            <NavLink to="/properties" className="nav-link-custom">Properties</NavLink>
                        </div>

                        <div className="col d-flex justify-content-end align-items-center">
                            <i className="bi bi-telephone text-secondary fs-6 me-2"></i>
                            <p className="fw-lighter text-black m-0 me-3">+38970428577</p>
                            <i className="bi bi-envelope text-secondary fs-6 me-2"></i>
                            <a className="fw-lighter text-black m-0" href="mailto:contact@olympus.com" style={{textDecoration: 'none'}}>Send us a mail</a>
                        </div>
                    </div>

                    <div className="navbar-line"></div>
                </div>
            </div>
        </>
    )
}