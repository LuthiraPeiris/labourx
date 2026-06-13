import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export function isBoostExpired(boostExpiresAt?: any) {
  if (!boostExpiresAt) return false;

  let expiryDate: Date;

  if (boostExpiresAt?.toDate) {
    expiryDate = boostExpiresAt.toDate();
  } else {
    expiryDate = new Date(boostExpiresAt);
  }

  if (Number.isNaN(expiryDate.getTime())) return false;

  return expiryDate.getTime() < Date.now();
}

export async function expirePostBoostIfNeeded(post: any) {
  if (post.boostStatus !== 'active') return post;

  if (!isBoostExpired(post.boostExpiresAt)) return post;

  const expiredData = {
    isBoosted: false,
    boostStatus: 'expired',
    boostBadge: '',
    boostPlan: '',
    boostExpiredAt: new Date().toISOString(),
  };

  await updateDoc(doc(db, 'posts', post.id), expiredData);

  return {
    ...post,
    ...expiredData,
  };
}

export async function expireProfileBoostIfNeeded(user: any) {
  if (user.boostStatus !== 'active') return user;

  if (!isBoostExpired(user.boostExpiresAt)) return user;

  const expiredData = {
    isBoosted: false,
    boostStatus: 'expired',
    boostBadge: '',
    boostPlan: '',
    boostExpiredAt: new Date().toISOString(),
  };

  await updateDoc(doc(db, 'users', user.id), expiredData);

  return {
    ...user,
    ...expiredData,
  };
}