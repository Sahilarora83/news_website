import React, { useEffect, useState } from 'react';
import {
  getBookmarkedStoryIds,
  getLikedStoryIds,
  toggleBookmarkedStory,
  toggleLikedStory,
} from '../../lib/story-actions';

const actionConfig = {
  bookmark: {
    activeClass: 'fas fa-bookmark',
    inactiveClass: 'far fa-bookmark',
    label: 'Save story',
    loader: getBookmarkedStoryIds,
    toggle: toggleBookmarkedStory,
  },
  like: {
    activeClass: 'fas fa-heart',
    inactiveClass: 'far fa-heart',
    label: 'Like story',
    loader: getLikedStoryIds,
    toggle: toggleLikedStory,
  },
};

const StoryActionButton = ({ storyId, action = 'bookmark', className = 'bookmark-btn', title }) => {
  const config = actionConfig[action] || actionConfig.bookmark;
  const [active, setActive] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const syncState = async () => {
      try {
        const items = await config.loader();
        if (!cancelled) {
          setActive(items.includes(String(storyId)));
        }
      } catch {
        if (!cancelled) {
          setActive(false);
        }
      }
    };

    syncState();
    window.addEventListener('storage', syncState);
    window.addEventListener('story-actions-updated', syncState);

    return () => {
      cancelled = true;
      window.removeEventListener('storage', syncState);
      window.removeEventListener('story-actions-updated', syncState);
    };
  }, [config, storyId]);

  return (
    <button
      className={className}
      type="button"
      aria-pressed={active}
      aria-label={title || config.label}
      title={title || config.label}
      disabled={pending}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        setPending(true);
        try {
          setActive(await config.toggle(storyId, active));
        } finally {
          setPending(false);
        }
      }}
    >
      <i className={active ? config.activeClass : config.inactiveClass} />
    </button>
  );
};

export default StoryActionButton;
