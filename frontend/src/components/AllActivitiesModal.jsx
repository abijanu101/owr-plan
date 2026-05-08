// src/components/AllActivitiesModal.js
import React from 'react';
import Modal from './Modal';
import Button from './UI/Button';
import ActivityCard from './ActivityCard';

export default function AllActivitiesModal({ isOpen, onClose, activities }) {
  // activities should already be transformed and sorted (the shape ActivityCard expects)
  return (
    <Modal
      open={isOpen}
      title={`All Activities (${activities.length})`}
      onClose={onClose}
      footer={
        <Button onClick={onClose} variant="primary">Close</Button>
      }
    >
      <div style={{
        maxHeight: '60vh',
        overflowY: 'auto',
        paddingBottom: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        {activities.map(activity => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </Modal>
  );
}