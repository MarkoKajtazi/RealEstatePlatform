import {Link, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {deleteProperty, fetchProperty} from "../../services/propertyService.js";
import ListingTable from "../listing/ListingTable.jsx";
import plus from "../../assets/plus.svg";

export default function PropertyDetails() {
    const {id} = useParams();
    const [property, setProperty] = useState();
    const [loading, setLoading] = useState(true);
    const [previewMedia, setPreviewMedia] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;
        if (!id) return;

        async function load() {
            try {
                const data = await fetchProperty(id.toString());
                if (!mounted) return;
                setProperty(data);
                // set the first media as default preview
                if (data.images?.length > 0) setPreviewMedia(data.images[0]);
            } catch (err) {
                console.error("Failed to load properties", err);
                if (mounted) setProperty(null);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
    }, [id]);

    async function handleDelete() {
        const confirmed = window.confirm("Are you sure you want to delete this property?");
        if (!confirmed) return;

        try {
            await deleteProperty(id.toString());
            navigate("/admin", {replace: true});
        } catch (err) {
            console.error("Failed to delete property", err);
            alert("Failed to delete property. Please try again.");
        }
    }

    if (loading) return <h1>Loading...</h1>;

    const isVideo = previewMedia?.mimeType?.startsWith("video/");
    console.log(property)

    return (
        <div className="text-white bg-dark rounded-3 p-2 d-flex flex-column" style={{height: "100%", minHeight: 0}}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center px-3">
                <h1>{property.name}</h1>
                <div className="m-0 p-0 d-flex align-items-center">
                    <Link to={`/admin/properties/${id}/edit`} className="btn btn-outline-light me-3">
                        Edit
                    </Link>
                    <button onClick={handleDelete} className="btn btn-outline-danger">
                        Delete
                    </button>
                </div>
            </div>

            <hr/>

            <div className="mt-0 px-3 flex-grow-1 overflow-auto" style={{minHeight: 0}}>
                <div className="row gap-3">
                    <div className="rounded-3 px-3 pt-1 m-0 text-center col-lg-2" style={{background: "#021526"}}>
                        <h5 className="card-title text-light fw-lighter">Square Meters:</h5>
                        <h4 className="card-body text-white m-2">{property.squareMeters}<span className="fs-6">m²</span></h4>
                    </div>
                    <div className="rounded-3 px-3 pt-1 m-0 text-center col-lg-2" style={{background: "#021526"}}>
                        <h5 className="card-title text-light fw-lighter">Floor Count:</h5>
                        <h4 className="card-body text-white m-2">{property.floorCount}</h4>
                    </div>
                    <div className="rounded-3 px-3 pt-1 m-0 text-center col-lg-2" style={{background: "#021526"}}>
                        <h5 className="card-title text-light fw-lighter">Parking Spaces:</h5>
                        <h4 className="card-body text-white m-2">{property.parkingSpaceCount}</h4>
                    </div>
                    <div className="rounded-3 px-3 pt-1 m-0 text-center col-lg-2" style={{background: "#021526"}}>
                        <h5 className="card-title text-light fw-lighter">Property Type:</h5>
                        <h4 className="card-body text-white m-2">{property?.propertyType === 0 ? "Building" : "House"}</h4>
                    </div>
                    <div className="rounded-3 px-3 pt-1 m-0 text-center col-lg-2" style={{background: "#021526"}}>
                        <h5 className="card-title text-light fw-lighter">Elevator:</h5>
                        <h4 className="card-body text-white m-2">{property?.hasElevator ? "Yes" : "No"}</h4>
                    </div>
                </div>


                <hr/>
                <div className="p-0 my-3">
                    <div className="d-flex align-items-center justify-content-between">
                        <h3>Listings</h3>
                        <Link to={`/admin/listings/new/${id}`} className="btn fw-bolder p-2 text-white">
                            <img src={plus} alt="" width="30px" height="30px"/>
                        </Link>
                    </div>
                    <ListingTable listings={property.listings}/>
                </div>

                {property?.images.length > 0 && (
                    <div className="my-3">
                        <hr/>

                        <h3>Media</h3>
                        <div className="container p-0 m-0 mb-3">
                            {previewMedia && isVideo ? (
                                <video
                                    controls
                                    src={previewMedia.url}
                                    className="preview"
                                    style={{display: "block", width: "100%", objectFit: "cover"}}
                                />
                            ) : (
                                <img
                                    src={previewMedia?.url}
                                    alt="Preview"
                                    className="preview"
                                    style={{display: "block", width: "100%", objectFit: "cover"}}
                                />
                            )}
                        </div>

                        <div className="d-flex mt-2 rounded-2 p-3"
                             style={{background: "#0f0f0f", gap: "10px", overflowX: "auto"}}>
                            {property.images?.map((image) => {
                                const thumbIsVideo = image.mimeType?.startsWith("video/");
                                return (
                                    <button
                                        key={image.id}
                                        className="btn p-0"
                                        style={{flex: "0 0 auto"}}
                                        onClick={() => setPreviewMedia(image)}
                                    >
                                        {thumbIsVideo ? (
                                            <video
                                                src={image.url}
                                                playsInline
                                                loop
                                                style={{display: "block", width: "150px", objectFit: "cover"}}
                                            />
                                        ) : (
                                            <img
                                                src={image.url}
                                                alt="Property media"
                                                style={{display: "block", width: "150px", objectFit: "cover"}}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
