import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/home.css";
import {WordsPullUp} from "../components/WordsPullUp.jsx";
import Navigation from "@/components/Navigation.jsx";

export default function HomePage() {
    return (
        <div className="page-wrapper">
            <Navigation/>
            <div id="hero-section" className="container-fluid">
                <p id="brand-name" className="fs-1 fw-lighter">Olympus</p>

                <div id="hero-title">
                    <WordsPullUp text="Call your architect to design your house, call us to design" fontSize="2.5rem" className="d-flex"/>
                </div>

                <p id="hero-subtitle" className="fw-bolder">YOUR HOME<span className="fw-lighter">.</span></p>
            </div>
        </div>
    );
}
