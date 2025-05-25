// バッジ表示コンポーネント

import React from 'react';
import PropTypes from 'prop-types';
import { colors } from '../../styles/design-tokens';
import { BADGES } from '../../constants/education';

/**
 * 獲得バッジの表示
 */
const BadgeDisplay = ({ earnedBadges, showAll = false }) => {
  const badgesToShow = showAll 
    ? Object.values(BADGES)
    : Object.values(BADGES).filter(badge => earnedBadges.includes(badge.id));

  if (badgesToShow.length === 0 && !showAll) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span 
        className="text-sm font-medium"
        style={{ color: colors.ui.text.secondary }}
      >
        バッジ:
      </span>
      <div className="flex gap-2">
        {badgesToShow.map(badge => {
          const isEarned = earnedBadges.includes(badge.id);
          
          return (
            <div
              key={badge.id}
              className={`relative group ${isEarned ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              title={badge.name}
            >
              {/* バッジアイコン */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                  isEarned ? 'hover:scale-110' : ''
                }`}
                style={{
                  backgroundColor: isEarned 
                    ? colors.ui.accent.primary + '20' 
                    : colors.ui.background,
                  border: `2px solid ${
                    isEarned ? colors.ui.accent.primary : colors.ui.border
                  }`,
                  opacity: isEarned ? 1 : 0.3
                }}
              >
                {badge.icon}
              </div>

              {/* ツールチップ */}
              <div
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50"
                style={{
                  backgroundColor: colors.ui.text.primary,
                  color: colors.ui.surface
                }}
              >
                <div className="text-sm font-medium">{badge.name}</div>
                <div className="text-xs opacity-80">{badge.description}</div>
                {/* 矢印 */}
                <div
                  className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px"
                  style={{
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: `6px solid ${colors.ui.text.primary}`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

BadgeDisplay.propTypes = {
  earnedBadges: PropTypes.arrayOf(PropTypes.string).isRequired,
  showAll: PropTypes.bool
};

export default BadgeDisplay;