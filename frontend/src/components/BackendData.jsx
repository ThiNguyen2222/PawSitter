import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DataFromBackend = () => {
  const [details, setDetails] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000')
      .then(res => setDetails(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <hr />
      {details.map((output, id) => (
        <div key={id}>
          <h2>{output.employee}</h2>
          <h3>{output.department}</h3>
        </div>
      ))}
    </div>
  );
};

export default DataFromBackend;
