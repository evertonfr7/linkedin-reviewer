'use client';

import { ProfileData } from '@/types/analysis';

interface ProfileSnapshotProps {
  profile: ProfileData;
  profilePhoto?: string | null;
}

export default function ProfileSnapshot({ profile, profilePhoto }: ProfileSnapshotProps) {
  const photoSrc = profilePhoto && profilePhoto !== 'analysed' ? profilePhoto : profile.photoUrl;
  const photoAnalysed = profilePhoto === 'analysed';
  
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-4">
        {photoSrc ? (
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-secondary-container">
            <img 
              src={photoSrc} 
              alt={profile.name || 'Profile'}
              className="w-full h-full object-cover"
            />
          </div>
        ) : photoAnalysed ? (
          <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center" title="Foto analisada">
            <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
            <svg className="w-8 h-8 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h2 className="font-headline font-bold text-xl text-on-surface truncate">
            {profile.name || 'Perfil Desconhecido'}
          </h2>
          <p className="text-on-surface-variant truncate">
            {profile.headline || 'Sem título'}
          </p>
          {profile.location && (
            <p className="text-sm text-outline flex items-center gap-1 mt-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profile.location}
            </p>
          )}
        </div>

        {profile.url && (
          <a 
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 p-2 rounded-full hover:bg-surface-container-high transition-colors"
            title="Ver no LinkedIn"
          >
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-outline-variant">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
            <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{profile.experiences.length} experiências</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
            <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>{profile.skills.length} competências</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
            <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{profile.recommendationsReceived} recomendações</span>
          </div>
          
          {profile.certifications.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
              <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span>{profile.certifications.length} certificações</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
