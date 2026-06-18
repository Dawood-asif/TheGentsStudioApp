import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import { api } from '../api/client.js';

function Stars({ rating }) {
  return <span className="review-stars">{'★'.repeat(Number(rating || 0))}{'☆'.repeat(5 - Number(rating || 0))}</span>;
}

function ReviewImage({ row }) {
  if (!row.review_image_url) return <span className="muted">No image</span>;
  return <img className="review-thumb" src={row.review_image_url} alt="Review" />;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState('Loading reviews...');

  const load = () => {
    api.adminReviews()
      .then(result => {
        setReviews(result.data);
        setMessage('Reviews loaded.');
      })
      .catch(error => setMessage(error.message));
  };

  useEffect(() => { load(); }, []);

  const approve = async id => {
    try {
      await api.approveReview(id);
      setMessage('Review approved.');
      load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const reject = async id => {
    try {
      await api.rejectReview(id);
      setMessage('Review hidden/rejected.');
      load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const columns = [
    { key: 'review_image_url', label: 'Image', render: row => <ReviewImage row={row} /> },
    { key: 'reviewer_name', label: 'Reviewer', render: row => row.reviewer_name || row.customer_name || 'Customer' },
    { key: 'rating', label: 'Rating', render: row => <Stars rating={row.rating} /> },
    { key: 'comment', label: 'Review' },
    { key: 'source', label: 'Source', render: row => <span className="badge">{row.source}</span> },
    { key: 'approved', label: 'Status', render: row => <span className={`stock-badge ${row.approved ? 'ok' : 'warning'}`}>{row.approved ? 'Approved' : 'Pending'}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: row => (
        <div className="toolbar">
          <button className="btn secondary" onClick={() => approve(row.id)}>Approve</button>
          <button className="btn secondary" onClick={() => reject(row.id)}>Hide</button>
        </div>
      ),
    },
  ];

  return (
    <section className="card">
      <div className="toolbar">
        <button className="btn" onClick={load}>Refresh Reviews</button>
      </div>
      <h2>Customer Reviews</h2>
      <p className="muted">Approve customer app reviews before they appear publicly. Google reviews can be linked separately.</p>
      <p className="muted">{message}</p>
      <DataTable columns={columns} rows={reviews} empty="No reviews yet." />
    </section>
  );
}
