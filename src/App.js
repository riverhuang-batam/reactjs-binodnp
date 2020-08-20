import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Container,
  Row,
  Col,
  Navbar,
  Nav,
} from "react-bootstrap";
import axios from "axios";
import "./App.css";

function App() {
  const [photo, setPhotos] = useState([]);
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(null);
  const [limit, setLimits] = useState(25);
  const [deleteFile, setDeleteFiles] = useState([]);
  const [deletes, showDeletes] = useState(false);
  const [album, setAlbum] = useState([]);
  const [file, setFiles] = useState(null);
  const [albums, setAlbums] = useState("");

  useEffect(() => {
    axios
      .post("http://localhost:8888/photos/list", {
        limit: limit,
        skip: 0,
      })
      .then(
        items => {
          setPhotos(items.data.documents)
          setCount(items.data.count)
          setAlbum(items.data.documents.map((item) => item.album))
        }
      );
    if (deleteFile.length > 0) {
      showDeletes(true);
    } else {
      showDeletes(false)
    }
  }, [limit, deleteFile, file]);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const selectFile = (e) => {
    const imageValidator =
      e.target.files[0].type === "image/gif" ||
      e.target.files[0].type === "image/jpg" ||
      e.target.files[0].type === "image/png" ||
      e.target.files[0].type === "image/jpeg" ||
      e.target.files[0].type === "image/svg" ||
      e.target.files[0].type === "image/webp";
    if (imageValidator) {
      console.log("test");
      setFiles(e.target.files[0]);
    } else {
      return alert("Image Only");
    }
  };

  const uploadImage = (e) => {
    e.preventDefault();
    const fd = new FormData();
    console.log(file);
    fd.append("documents", file);
    fd.append("album", albums);
    axios
      .put("http://localhost:8888/photos", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          console.log(
            `Upload Progress: ${
              (progressEvent.loaded, progressEvent.total)
            } ${Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            )} %`
          );
        },
      })
      .then((i) => {
        // console.log(i)
        setShow(false);
        setFiles(null);
      })
      .catch((err) => alert("please upload the image & choose the album"));
  };

  const addMoreLimit = () => {
    setLimits((prevState) => (prevState += prevState));
  };
  const clickedPhoto = (album, name, e) => {
    console.log(e.target.checked, "VALUE");
    const deleteItems = [...deleteFile];
    let existingAlbumIndex = deleteItems.findIndex(
      (item) => item.album === album
    );
    if (e.target.checked) {
      console.log("TRUE");
      if (existingAlbumIndex >= 0) {
        let photoDocument = deleteItems[existingAlbumIndex].documents;
        let photoDocsArr = photoDocument.split(", ");
        photoDocsArr.push(name);
        let photoDocsJoin = photoDocsArr.join(", ");
        deleteItems[existingAlbumIndex].documents = photoDocsJoin;
      } else {
        deleteItems.push({
          album: album,
          documents: name,
        });
      }
    } else {
      if (existingAlbumIndex >= 0) {
        let photoDocument = deleteItems[existingAlbumIndex].documents;
        let photoDocsArr = photoDocument.split(", ");
        let filteredDocs = photoDocsArr.filter(
          (value, index) => value !== name
        );
        let photoDocsJoin = filteredDocs.join(", ");
        deleteItems[existingAlbumIndex].documents = photoDocsJoin;
        if (filteredDocs.length === 0) {
          deleteItems.splice(existingAlbumIndex, 1);
        }
      }
    }
    setDeleteFiles(deleteItems);
  };
  const deletePhotos = (e) => {
    e.preventDefault();
    axios
      .delete(`http://localhost:8888/photos`, {
        data: deleteFile,
      })
      .then((i) => console.log(i))
      .catch((err) => console.log(err));
    setDeleteFiles([]);
    showDeletes(false);
  };

  return (
    <div className="App">
      <Navbar collapseOnSelect expand="lg">
        <Navbar.Brand>Photos</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ml-auto">
            {deletes && (
              <Nav.Link className="pointer" onClick={deletePhotos}>
                  <i className="fa fa-trash-o" aria-hidden="true"></i>
                  Delete
              </Nav.Link>
            )}
            <Nav.Link className="pointer" onClick={handleShow}>
              <i className="fa fa-upload" aria-hidden="true"></i>
                Upload
            </Nav.Link>
            <Nav.Link className="pointer">{limit}</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Container fluid>
        <Row>
          {photo.map((item) => {
            // console.log(item);
            return (
              <Col key={item.id} className="text-center">
                <input
                    type="checkbox"
                    id={item.name}
                    onClick={(e) => clickedPhoto(item.album, item.name, e)}
                  />
                  <label htmlFor={item.name}>
                <img src={item.raw} alt={item.name} />
                </label>
                <h5>{item.album}</h5>
                <p>{item.name}</p>
              </Col>
            );
          })}
        </Row>
        {limit <= count ? (
          <Button variant="outline-dark" className="mt-4 mb-4" onClick={addMoreLimit} block>
            Load More
          </Button>
        ) : (
          ""
        )}
      </Container>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Photo</Modal.Title>
        </Modal.Header>
        <form onSubmit={uploadImage}>
          <Modal.Body>
            <Form.Group>
            <Form.Control
              as="select"
              onChange={(e) => setAlbums(e.target.value)}
            >
              <option>select album</option>

              {album
                .filter((v, i) => album.indexOf(v) === i)
                .map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
            </Form.Control>
            </Form.Group>
            <Form.Group>
              <input
                className="form-control-file"
                accept=".jpg, .png, .webp, .jpeg"
                // ref={inputRef}
                type="file"
                multiple
                onChange={selectFile}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-primary" disabled={!file || (!albums && true)}>
              Uploads
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}

export default App;
