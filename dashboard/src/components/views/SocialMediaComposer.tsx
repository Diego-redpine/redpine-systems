'use client';

import React, { useState, useEffect } from 'react';
import CenterModal from '@/components/ui/CenterModal';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface SocialMediaComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  configColors: DashboardColors;
  isSaving?: boolean;
  existingPost?: Record<string, unknown> | null;
}

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', color: '#E4405F' },
  { value: 'facebook', label: 'Facebook', color: '#1877F2' },
  { value: 'twitter', label: 'X / Twitter', color: '#1DA1F2' },
  { value: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { value: 'google_business', label: 'Google Business', color: '#4285F4' },
  { value: 'tiktok', label: 'TikTok', color: '#000000' },
];

const HASHTAG_SUGGESTIONS: Record<string, string[]> = {
  instagram: ['#instagood', '#photooftheday', '#smallbusiness', '#support'],
  facebook: ['#community', '#localbusiness', '#update'],
  twitter: ['#trending', '#news', '#thread'],
  linkedin: ['#professional', '#networking', '#growth'],
  google_business: ['#localseo', '#googlebusiness'],
  tiktok: ['#fyp', '#viral', '#smallbiz'],
};

export default function SocialMediaComposer({ isOpen, onClose, onSave, configColors, isSaving, existingPost }: SocialMediaComposerProps) {
  const [postTitle, setPostTitle] = useState('');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [status, setStatus] = useState<'draft' | 'scheduled'>('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (existingPost) {
        setPostTitle(String(existingPost.post_title || ''));
        setContent(String(existingPost.content || ''));
        setPlatform(String(existingPost.platform || 'instagram'));
        setStatus(existingPost.status === 'scheduled' ? 'scheduled' : 'draft');
        if (existingPost.scheduled_at) {
          const d = new Date(String(existingPost.scheduled_at));
          setScheduledDate(d.toISOString().split('T')[0]);
          setScheduledTime(d.toTimeString().substring(0, 5));
        }
        setHashtags((existingPost.hashtags as string[]) || []);
      } else {
        setPostTitle('');
        setContent('');
        setPlatform('instagram');
        setStatus('draft');
        setScheduledDate('');
        setScheduledTime('09:00');
        setHashtags([]);
      }
      setHashtagInput('');
    }
  }, [isOpen, existingPost]);

  const buttonBg = configColors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonBg);
  const cardBg = configColors.cards || '#FFFFFF';
  const textColor = configColors.text || '#6B7280';
  const headingColor = configColors.headings || '#1A1A1A';
  const borderColor = configColors.borders || '#E5E7EB';

  const charLimit = platform === 'twitter' ? 280 : platform === 'linkedin' ? 3000 : 2200;
  const contentLength = content.length;
  const isOverLimit = contentLength > charLimit;

  const addHashtag = (tag: string) => {
    const cleaned = tag.startsWith('#') ? tag : `#${tag}`;
    if (!hashtags.includes(cleaned)) {
      setHashtags(prev => [...prev, cleaned]);
    }
    setHashtagInput('');
  };

  const removeHashtag = (tag: string) => {
    setHashtags(prev => prev.filter(h => h !== tag));
  };

  const handleSave = () => {
    let scheduledAt: string | null = null;
    if (status === 'scheduled' && scheduledDate) {
      scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    }

    onSave({
      post_title: postTitle,
      content,
      platform,
      status,
      scheduled_at: scheduledAt,
      hashtags,
      image_urls: [],
    });
  };

  const currentPlatform = PLATFORMS.find(p => p.value === platform);
  const suggestions = HASHTAG_SUGGESTIONS[platform] || [];

  return (
    <CenterModal isOpen={isOpen} onClose={onClose} title={existingPost ? 'Edit Post' : 'Compose Post'}>
      <div className="space-y-5">
        {/* Platform selector */}
        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: headingColor }}>Platform</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => {
              const selected = platform === p.value;
              return (
                <button
                  key={p.value}
                  onClick={() => setPlatform(p.value)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: selected ? p.color : 'transparent',
                    color: selected ? '#FFFFFF' : textColor,
                    border: `1.5px solid ${selected ? p.color : borderColor}`,
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Post title */}
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: headingColor }}>Title</label>
          <input
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Give this post a name (internal only)"
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: headingColor }}
          />
        </div>

        {/* Content */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium" style={{ color: headingColor }}>Content</label>
            <span className="text-xs" style={{ color: isOverLimit ? '#EF4444' : textColor }}>
              {contentLength}/{charLimit}
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post..."
            rows={5}
            className="w-full px-3 py-2 rounded-lg text-sm resize-none"
            style={{
              border: `1px solid ${isOverLimit ? '#EF4444' : borderColor}`,
              backgroundColor: cardBg,
              color: headingColor,
            }}
          />
        </div>

        {/* Hashtags */}
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: headingColor }}>Hashtags</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {hashtags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                style={{ backgroundColor: `${currentPlatform?.color || buttonBg}20`, color: currentPlatform?.color || buttonBg }}
              >
                {tag}
                <button onClick={() => removeHashtag(tag)} className="ml-0.5 hover:opacity-70">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && hashtagInput.trim()) { e.preventDefault(); addHashtag(hashtagInput.trim()); } }}
              placeholder="Add a hashtag..."
              className="flex-1 px-3 py-1.5 rounded-lg text-sm"
              style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: headingColor }}
            />
          </div>
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {suggestions.filter(s => !hashtags.includes(s)).map(s => (
                <button
                  key={s}
                  onClick={() => addHashtag(s)}
                  className="px-2 py-0.5 rounded-full text-xs transition-opacity hover:opacity-70"
                  style={{ backgroundColor: `${borderColor}80`, color: textColor }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Schedule */}
        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: headingColor }}>When to post</label>
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setStatus('draft')}
              className="px-4 py-2 rounded-lg text-sm font-medium flex-1"
              style={{
                backgroundColor: status === 'draft' ? buttonBg : 'transparent',
                color: status === 'draft' ? buttonText : textColor,
                border: `1px solid ${status === 'draft' ? buttonBg : borderColor}`,
              }}
            >
              Save as Draft
            </button>
            <button
              onClick={() => setStatus('scheduled')}
              className="px-4 py-2 rounded-lg text-sm font-medium flex-1"
              style={{
                backgroundColor: status === 'scheduled' ? buttonBg : 'transparent',
                color: status === 'scheduled' ? buttonText : textColor,
                border: `1px solid ${status === 'scheduled' ? buttonBg : borderColor}`,
              }}
            >
              Schedule
            </button>
          </div>

          {status === 'scheduled' && (
            <div className="flex gap-3">
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-sm"
                style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: headingColor }}
              />
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm"
                style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: headingColor }}
              />
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="rounded-xl p-4" style={{ backgroundColor: `${currentPlatform?.color || buttonBg}08`, border: `1px solid ${borderColor}` }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: currentPlatform?.color || '#999' }} />
            <span className="text-xs font-semibold" style={{ color: headingColor }}>{currentPlatform?.label} Preview</span>
          </div>
          <p className="text-sm whitespace-pre-wrap" style={{ color: headingColor }}>
            {content || 'Your post content will appear here...'}
          </p>
          {hashtags.length > 0 && (
            <p className="text-sm mt-2" style={{ color: currentPlatform?.color || buttonBg }}>
              {hashtags.join(' ')}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between mt-6">
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ color: textColor }}>
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!postTitle.trim() || isOverLimit || isSaving || (status === 'scheduled' && !scheduledDate)}
          className="px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: buttonBg, color: buttonText }}
        >
          {isSaving ? 'Saving...' : status === 'scheduled' ? 'Schedule Post' : 'Save Draft'}
        </button>
      </div>
    </CenterModal>
  );
}
