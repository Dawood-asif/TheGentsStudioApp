import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const DEFAULT_ABOUT = {
  googleProfileUrl: 'https://www.google.com/search?q=The+Gents+studio+%26+spa',
  philosophyTitle: 'Our Philosophy',
  philosophy: '',
  founder: { name: 'Muhammad Asif', title: 'Founder & Visionary', photoUrl: '', bio: '', quote: '' },
  ceo: { name: 'Dawood Asif', title: 'CEO & Operations Manager', photoUrl: '', bio: '', quote: '' },
  awards: ['Best Budget Salon Lahore 2025'],
  salonPhotos: [],
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AboutUsPage() {
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [message, setMessage] = useState('Load and edit salon story, founder/CEO details, and photos.');

  const load = () => {
    api.settings()
      .then(result => {
        const row = result.data.find(item => item.key === 'aboutUs');
        if (row?.value) setAbout({ ...DEFAULT_ABOUT, ...row.value });
        setMessage('About Us settings loaded.');
      })
      .catch(error => setMessage(error.message));
  };

  useEffect(() => { load(); }, []);

  const update = (key, value) => setAbout(current => ({ ...current, [key]: value }));

  const updatePerson = (person, key, value) => {
    setAbout(current => ({
      ...current,
      [person]: { ...current[person], [key]: value },
    }));
  };

  const uploadPersonPhoto = async (person, file) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    updatePerson(person, 'photoUrl', dataUrl);
  };

  const uploadSalonPhoto = async file => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setAbout(current => ({
      ...current,
      salonPhotos: [...(current.salonPhotos || []), dataUrl],
    }));
  };

  const removeSalonPhoto = index => {
    setAbout(current => ({
      ...current,
      salonPhotos: current.salonPhotos.filter((_, photoIndex) => photoIndex !== index),
    }));
  };

  const updateAward = (index, value) => {
    setAbout(current => ({
      ...current,
      awards: current.awards.map((award, awardIndex) => awardIndex === index ? value : award),
    }));
  };

  const addAward = () => {
    setAbout(current => ({ ...current, awards: [...current.awards, 'New Award'] }));
  };

  const save = async () => {
    try {
      await api.updateSetting('aboutUs', about);
      setMessage('About Us saved successfully. Mobile app will show updated story/photos.');
      load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="grid">
      <section className="card">
        <h2>About Us Editor</h2>
        <p className="muted">Edit salon story, founder, CEO, Google profile link, awards, and photos. Photos are stored as data images for now.</p>
        <div className="form-grid">
          <input value={about.googleProfileUrl} onChange={event => update('googleProfileUrl', event.target.value)} placeholder="Google Business Profile / Review URL" />
          <input value={about.philosophyTitle} onChange={event => update('philosophyTitle', event.target.value)} placeholder="Philosophy title" />
          <textarea value={about.philosophy} onChange={event => update('philosophy', event.target.value)} rows="7" placeholder="Salon philosophy/story" />
        </div>
      </section>

      <section className="card">
        <h2>Founder</h2>
        <div className="about-person-grid">
          <div className="about-photo-box">
            {about.founder?.photoUrl ? <img src={about.founder.photoUrl} alt="Founder" /> : <span>No founder photo</span>}
            <input type="file" accept="image/*" onChange={event => uploadPersonPhoto('founder', event.target.files?.[0])} />
          </div>
          <div className="form-grid">
            <input value={about.founder?.name || ''} onChange={event => updatePerson('founder', 'name', event.target.value)} placeholder="Founder name" />
            <input value={about.founder?.title || ''} onChange={event => updatePerson('founder', 'title', event.target.value)} placeholder="Founder title" />
            <textarea value={about.founder?.bio || ''} onChange={event => updatePerson('founder', 'bio', event.target.value)} rows="6" placeholder="Founder bio" />
            <textarea value={about.founder?.quote || ''} onChange={event => updatePerson('founder', 'quote', event.target.value)} rows="3" placeholder="Founder quote" />
          </div>
        </div>
      </section>

      <section className="card">
        <h2>CEO / Operations Manager</h2>
        <div className="about-person-grid">
          <div className="about-photo-box">
            {about.ceo?.photoUrl ? <img src={about.ceo.photoUrl} alt="CEO" /> : <span>No CEO photo</span>}
            <input type="file" accept="image/*" onChange={event => uploadPersonPhoto('ceo', event.target.files?.[0])} />
          </div>
          <div className="form-grid">
            <input value={about.ceo?.name || ''} onChange={event => updatePerson('ceo', 'name', event.target.value)} placeholder="CEO name" />
            <input value={about.ceo?.title || ''} onChange={event => updatePerson('ceo', 'title', event.target.value)} placeholder="CEO title" />
            <textarea value={about.ceo?.bio || ''} onChange={event => updatePerson('ceo', 'bio', event.target.value)} rows="6" placeholder="CEO bio" />
            <textarea value={about.ceo?.quote || ''} onChange={event => updatePerson('ceo', 'quote', event.target.value)} rows="3" placeholder="CEO quote" />
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Awards</h2>
        <div className="form-grid">
          {(about.awards || []).map((award, index) => (
            <input key={index} value={award} onChange={event => updateAward(index, event.target.value)} placeholder="Award" />
          ))}
          <button className="btn secondary" onClick={addAward}>Add Award</button>
        </div>
      </section>

      <section className="card">
        <h2>Salon Photos</h2>
        <input type="file" accept="image/*" onChange={event => uploadSalonPhoto(event.target.files?.[0])} />
        <div className="salon-photo-grid">
          {(about.salonPhotos || []).map((photo, index) => (
            <div className="salon-photo-card" key={index}>
              <img src={photo} alt={`Salon ${index + 1}`} />
              <button className="btn secondary" onClick={() => removeSalonPhoto(index)}>Remove</button>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="toolbar">
          <button className="btn" onClick={save}>Save About Us</button>
          <button className="btn secondary" onClick={load}>Reload</button>
        </div>
        <p className="muted">{message}</p>
      </section>
    </div>
  );
}
