import React, { ChangeEvent, FormEvent, useState } from "react";
import { Map, Marker, TileLayer } from "react-leaflet";
import { LatLng, LeafletMouseEvent } from "leaflet";
import { FiPlus, FiSearch } from "react-icons/fi";

import "../styles/pages/create-orphanage.css";
import Sidebar from "../components/Sidebar";
import happyMapIcon from "../utils/mapIcon";
import api from "../services/api";
import { useHistory } from "react-router-dom";
import axios from "axios";

export default function CreateOrphanage() {
  const history = useHistory();

  const [position, setPosition] = useState({ latitude: 0, longitude: 0 });

  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [centerMap, setCenterMap] = useState<any>([
    -22.036965895,
    -42.1661668410429,
  ]);
  const [about, setAbout] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [opening_hours, setOpeningHours] = useState<string>("");
  const [open_on_weekends, setOpenOnWeekends] = useState<boolean>(true);
  const [images, setImages] = useState<File[]>();
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  function handleMapClick(event: LeafletMouseEvent) {
    const { lat, lng } = event.latlng;

    setPosition({
      latitude: lat,
      longitude: lng,
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { latitude, longitude } = position;

    const data = new FormData();

    data.append("name", name);
    data.append("about", about);
    data.append("latitude", String(latitude));
    data.append("longitude", String(longitude));
    data.append("instructions", instructions);
    data.append("opening_hours", opening_hours);
    data.append("open_on_weekends", String(open_on_weekends));

    for (let image of images ? images : []) {
      data.append("images", image);
    }

    await api.post("orphanages", data);

    alert("Cadastro realizado com sucesso!");

    history.push("/app");
  }

  function handleSelectImages(event: ChangeEvent<HTMLInputElement>) {
    console.log(event.target.files ? event.target.files[0] : null);
    if (!event.target.files) return;

    const selectedImages = Array.from(event.target.files);

    setImages(selectedImages);

    const selectedImagesPreview = selectedImages.map((image) =>
      URL.createObjectURL(image)
    );

    setPreviewImages(selectedImagesPreview);
  }

  function handleSearchLocation(location: string) {
    setLocation(location);
  }

  function handleSearch() {
    if (location) {
      const searchUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        location
      )}.json?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`;

      console.log(searchUrl);

      axios.get(searchUrl).then((response) => {
        for (let feature of response.data.features) {
          if (feature.place_type[0] === "region") {
            console.log(feature);
            console.log(feature.center);
            setCenterMap([feature.center[1], feature.center[0]]);
          }
        }
      });
    }
  }

  return (
    <div id="page-create-orphanage">
      <Sidebar />

      <main>
        <form className="create-orphanage-form">
          <fieldset>
            <legend>Dados</legend>
            <div id="search">
              <div className="input-block">
                <label htmlFor="local">Local</label>
                <input
                  id="local"
                  value={location}
                  onChange={(event) => handleSearchLocation(event.target.value)}
                />
              </div>
              <button
                className="search-button"
                onClick={handleSearch}
                type="button"
              >
                <FiSearch size={32} color="#fff" />
              </button>
            </div>

            <Map
              center={centerMap}
              style={{ width: "100%", height: 280 }}
              zoom={15}
              onclick={handleMapClick}
            >
              <TileLayer
                url={`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`}
              />

              {position.latitude !== 0 && (
                <Marker
                  interactive={false}
                  icon={happyMapIcon}
                  position={[position.latitude, position.longitude]}
                />
              )}
            </Map>

            <div className="input-block">
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="about">
                Sobre <span>Máximo de 300 caracteres</span>
              </label>
              <textarea
                id="name"
                maxLength={300}
                value={about}
                onChange={(event) => setAbout(event.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="images">Fotos</label>

              <div className="uploaded-image"></div>

              <div className="images-container">
                <label htmlFor="image[]" className="new-image">
                  <FiPlus size={24} color="#15b6d6" />
                </label>

                {previewImages.map((image, index) => (
                  <img alt={name} src={image} key={index}></img>
                ))}

                <input
                  multiple
                  onChange={handleSelectImages}
                  type="file"
                  id="image[]"
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Visitação</legend>

            <div className="input-block">
              <label htmlFor="instructions">Instruções</label>
              <textarea
                id="instructions"
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="opening_hours">Horário de funcionamento</label>
              <input
                id="opening_hours"
                value={opening_hours}
                onChange={(event) => setOpeningHours(event.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="open_on_weekends">Atende fim de semana</label>

              <div className="button-select">
                <button
                  type="button"
                  className={open_on_weekends ? "active" : ""}
                  onClick={() => setOpenOnWeekends(true)}
                >
                  Sim
                </button>
                <button
                  type="button"
                  className={!open_on_weekends ? "active" : ""}
                  onClick={() => setOpenOnWeekends(false)}
                >
                  Não
                </button>
              </div>
            </div>
          </fieldset>

          <button
            className="confirm-button"
            onSubmit={handleSubmit}
            onClick={handleSubmit}
            type="submit"
          >
            Confirmar
          </button>
        </form>
      </main>
    </div>
  );
}

// return `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`;
