import {Calendar, Ruler, Building2, Car, ArrowUp} from "lucide-react";

export default function PropertyStats({year, squareMeters, floorCount, parkingSpaceCount, hasElevator,}) {
    const stats = [{icon: Calendar, value: year, label: "Year Built"}, {
        icon: Ruler,
        value: squareMeters,
        label: "Total m²"
    }, {icon: Building2, value: floorCount, label: "Floors"}, {icon: Car, value: parkingSpaceCount, label: "Parking"},];

    if (hasElevator) {
        stats.push({icon: ArrowUp, value: "✓", label: "Elevator"});
    }

    return (<div className="luxury-stats">
            {stats.map((stat, index) => (<div key={index} className="luxury-stat-item">
                    <stat.icon className="luxury-stat-icon"/>
                    <span className="luxury-stat-value">{stat.value}</span>
                    <span className="luxury-stat-label">{stat.label}</span>
                </div>))}
        </div>);
}
