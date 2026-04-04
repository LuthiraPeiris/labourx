import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  Briefcase,
  CheckCircle,
  Clock,
  Bookmark,
} from 'lucide-react';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Technician } from '../types';
import { db } from '../../firebase/config';
import { useAuth } from '../context/AuthContext';

interface TechnicianCardProps {
  technician: Technician;
  featured?: boolean;
}

export function TechnicianCard({
  technician,
  featured = false,
}: TechnicianCardProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const isClient = currentUser?.role === 'user';

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!currentUser || currentUser.role !== 'user' || !technician?.id) {
        setIsBookmarked(false);
        return;
      }

      try {
        const bookmarkId = `${currentUser.uid}_${technician.id}`;
        const bookmarkRef = doc(db, 'bookmarks', bookmarkId);
        const bookmarkSnap = await getDoc(bookmarkRef);
        setIsBookmarked(bookmarkSnap.exists());
      } catch (error) {
        console.error('Error checking bookmark status:', error);
        setIsBookmarked(false);
      }
    };

    checkBookmarkStatus();
  }, [currentUser, technician?.id]);

  const handleToggleBookmark = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!technician?.id) return;

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (currentUser.role !== 'user') {
      return;
    }

    try {
      setBookmarkLoading(true);

      const bookmarkId = `${currentUser.uid}_${technician.id}`;
      const bookmarkRef = doc(db, 'bookmarks', bookmarkId);

      if (isBookmarked) {
        await deleteDoc(bookmarkRef);
        setIsBookmarked(false);
      } else {
        await setDoc(bookmarkRef, {
          userId: currentUser.uid,
          technicianId: technician.id,
          createdAt: serverTimestamp(),
          technicianName: technician.name || '',
          technicianSpecialty: technician.specialty || '',
          technicianLocation:
            technician.location || technician.city || '',
          technicianAvatar: technician.avatar || '',
        });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const availabilityColors = {
    Available:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Busy: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Limited:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  const safeAvailability =
    technician.availability && availabilityColors[technician.availability]
      ? technician.availability
      : 'Available';

  const safeAvatar =
    technician.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      technician.name || 'Professional'
    )}&background=8B1A2F&color=fff`;

  const safeRating = Number(technician.rating || 0);
  const safeReviewCount = Number(technician.reviewCount || 0);
  const safeSkills = Array.isArray(technician.skills) ? technician.skills : [];
  const safeHourlyRate = technician.hourlyRate || 'Contact for pricing';
  const safeLocation =
    technician.location || technician.city || 'Location not specified';
  const safeExperience = Number(technician.yearsExperience || 0);
  const safeCompletedProjects = Number(technician.completedProjects || 0);

  return (
    <div
      className={`relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
        featured ? 'ring-2 ring-gold' : ''
      }`}
    >
      {featured && (
        <div
          className="bg-gold text-white text-xs text-center py-1 px-2"
          style={{ fontWeight: 600 }}
        >
          ⭐ Featured Professional
        </div>
      )}

      {isClient && (
        <button
          type="button"
          onClick={handleToggleBookmark}
          disabled={bookmarkLoading}
          title={isBookmarked ? 'Remove bookmark' : 'Save professional'}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Save professional'}
          className={`absolute left-3 z-10 p-2 rounded-full border ...
${featured ? 'top-10' : 'top-3'} ${
            isBookmarked
              ? 'bg-gold text-white border-gold shadow-md'
              : 'bg-white/90 text-maroon border-border hover:bg-maroon-light'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={safeAvatar}
              alt={technician.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-maroon/20"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    technician.name || 'Professional'
                  )}&background=8B1A2F&color=fff`;
              }}
            />
            {technician.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-maroon rounded-full p-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3
                  className="text-card-foreground truncate"
                  style={{ fontWeight: 600 }}
                >
                  {technician.name}
                </h3>
                <p
                  className="text-maroon text-sm"
                  style={{ fontWeight: 500 }}
                >
                  {technician.specialty}
                </p>
              </div>

              <span
                className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${availabilityColors[safeAvailability]}`}
                style={{ fontWeight: 500 }}
              >
                {safeAvailability}
              </span>
            </div>

            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3.5 h-3.5 fill-gold text-gold" />
              <span className="text-sm" style={{ fontWeight: 600 }}>
                {safeRating.toFixed(1)}
              </span>
              <span className="text-muted-foreground text-sm">
                ({safeReviewCount} reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{safeLocation}</span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{safeExperience} years experience</span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{safeCompletedProjects} projects completed</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {safeSkills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-xs px-2 py-0.5 rounded-full bg-maroon-light text-maroon border border-maroon/10"
            >
              {skill}
            </span>
          ))}
          {safeSkills.length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              +{safeSkills.length - 3} more
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-gold" style={{ fontWeight: 700 }}>
              {safeHourlyRate}
            </span>
          </div>

          <Link
            to={`/technician/${technician.id}`}
            className="bg-maroon text-white px-4 py-1.5 rounded-lg text-sm hover:bg-maroon-dark transition-colors"
            style={{ fontWeight: 500 }}
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}