import axios from 'axios'
import React from 'react'
import { useEffect } from 'react';

function Test() {
  useEffect(() => {
    const res = axios.get('http://127.0.0.1:5000/api/footfall')
      .then((response) => console.log(response));
    // console.log(res);
  }, [])

  const postApi = async () => {
    axios.post('http://127.0.0.1:5000/api/footfall', {
      "date": "2021-11-15",
      "hour": 14,
      "footfall": -150
    })
      .then((res) => console.log(res));
  }
  return (
    <div>Test
      <button onClick={postApi}>test</button>
    </div>
  )
}

export default Test