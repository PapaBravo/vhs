import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

function CourseMap({ filteredCourses }) {

    let DefaultIcon = L.icon({
        iconUrl: icon,
        shadowUrl: iconShadow
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    const courses = filteredCourses
        .map(c => c._source)
        .filter(c => c.veranstaltungsort?.adresse?.location);


    function courseMarker(c) {

        const position = [
            c.veranstaltungsort.adresse.location.lat,
            c.veranstaltungsort.adresse.location.lon
        ]

        const descriptions = c.text.map(t => <p key={t.eigenschaft} dangerouslySetInnerHTML={{ __html: t.text }}></p>)

        return (
            <Marker position={position} key={c.guid}>
                <Popup maxHeight="200">
                    <h2>{c.name}</h2>
                    {descriptions}
                </Popup>
            </Marker>
        )
    }


    return (
        <MapContainer center={[52.5, 13.4]} zoom={11} scrollWheelZoom={false} style={{ width: '100%', height: 600 }}>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {courses.map(c => courseMarker(c))}
        </MapContainer>
    );
}

export default CourseMap;