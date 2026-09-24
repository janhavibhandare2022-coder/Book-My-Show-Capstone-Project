import React, { useState, useEffect } from "react";
import '../styles/App.css';
import '../styles/bootstrap.min.css';
import { movies, slots, seats } from './data';

const App = () => {
  const [movie, setMovie] = useState(localStorage.getItem('movie') || '');
  const [slot, setSlot] = useState(localStorage.getItem('slot') || '');
  const [seatCount, setSeatCount] = useState(() => {
    const saved = localStorage.getItem('seats');
    return saved ? JSON.parse(saved) : { A1: 0, A2: 0, A3: 0, A4: 0, D1: 0, D2: 0 };
  });

  const [lastBooking, setLastBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem('movie', movie);
  }, [movie]);

  useEffect(() => {
    localStorage.setItem('slot', slot);
  }, [slot]);

  useEffect(() => {
    localStorage.setItem('seats', JSON.stringify(seatCount));
  }, [seatCount]);
// Last Booking fetch karnyasaathi
  useEffect(() => {
    fetch('http://localhost:8080/api/booking')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setLastBooking(data[0]);
        } else if (data && !Array.isArray(data) && data.movie) {
          setLastBooking(data);
        }
      })
      .catch((err) => console.log('Error fetching last booking:', err));
  }, []);

  // Fetch last booking
  const fetchLastBooking = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/booking');
      const data = await res.json();
      if (res.ok && !data.message) {
        setLastBooking(data);
      } else {
        setLastBooking(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLastBooking();
  }, []);
  const handleSeatChange = (seatName, val) => {
    setSeatCount((prev) => ({
      ...prev,
      [seatName]: Number(val),
    }));
  };
  const handleBooking = async () => {
    if (!movie) {
      setErrorMsg('Please select a movie');
      return;
    }
    if (!slot) {
      setErrorMsg('Please select a slot');
      return;
    }

    const totalSeats = Object.values(seatCount).reduce((a, b) => a + b, 0);
    if (totalSeats === 0) {
      setErrorMsg('Please select at least one seat');
      return;
    }

    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:8080/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          movie,
          slot,
          seats: seatCount
        })
      });

      if (response.status === 200) {
        setMovie('');
        setSlot('');
        setSeatCount({ A1: 0, A2: 0, A3: 0, A4: 0, D1: 0, D2: 0 });
        localStorage.clear();
        fetchLastBooking();
      } else {
        setErrorMsg('Booking failed, please try again.');
      }
    } catch (err) {
      setErrorMsg('Server error');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Book That Show</h2>
      <div className="row mt-4">
        {/* Selection Area */}
        <div className="col-md-8">
          {/* Movies */}
          <div className="card p-3 mb-3">
            <h5>Select A Movie</h5>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {movies.map((m, index) => (
                <button
                  key={index}
                  type="button"
                  className={`btn ${movie === m ? 'btn-danger' : 'btn-outline-secondary'}`}
                  onClick={() => setMovie(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Slots */}
          <div className="card p-3 mb-3">
            <h5>Select a Time Slot</h5>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {slots.map((s, index) => (
                <button
                  key={index}
                  type="button"
                  className={`btn ${slot === s ? 'btn-danger' : 'btn-outline-secondary'}`}
                  onClick={() => setSlot(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Seats */}
          <div className="card p-3 mb-3">
            <h5>Select the Seats</h5>
            <div className="d-flex flex-wrap gap-3 mt-2">
              {seats.map((seat, index) => (
                <div key={index} className="seat-box text-center">
                  <h6>Type {seat}</h6>
                  <input
                    type="number"
                    min="0"
                    className="form-control text-center"
                    style={{ width: '70px' }}
                    value={seatCount[seat] || 0}
                    onChange={(e) => handleSeatChange(seat, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

          <button className="btn btn-primary btn-lg" onClick={handleBooking}>
            Book Now
          </button>
        </div>

        {/* Last Booking Details Area */}
        <div className="col-md-4">
          <div className="card p-3">
            <h5>Last Booking Details:</h5>
            {lastBooking ? (
              <div className="mt-2">
                <p><strong>seats:</strong></p>
                <ul>
                  {Object.entries(lastBooking.seats || {}).map(([sName, count]) => (
                    <li key={sName}>{sName}: {count}</li>
                  ))}
                </ul>
                <p><strong>slot:</strong> {lastBooking.slot}</p>
                <p><strong>movie:</strong> {lastBooking.movie}</p>
              </div>
            ) : (
              <p className="text-muted mt-2">no previous booking found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;