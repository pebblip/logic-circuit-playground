// ゲートのビジュアルアイコンコンポーネント

import React from 'react';
import PropTypes from 'prop-types';
import { colors } from '../../styles/design-tokens';

/**
 * ゲートの形状を表現するSVGアイコン
 */
const GateIcon = ({ type, size = 24, color = colors.ui.text.primary }) => {
  const iconProps = {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };

  switch (type) {
    case 'INPUT':
      return (
        <svg {...iconProps}>
          <circle cx="24" cy="24" r="10" fill={color} />
          <path d="M34 24 H40" stroke={color} />
        </svg>
      );

    case 'OUTPUT':
      return (
        <svg {...iconProps}>
          <circle cx="24" cy="24" r="10" fill="none" />
          <path d="M8 24 H14" stroke={color} />
        </svg>
      );

    case 'AND':
      return (
        <svg {...iconProps}>
          <path d="M8 12 H24 A12 12 0 0 1 24 36 H8 Z" />
          <path d="M2 18 H8 M2 30 H8 M36 24 H42" />
        </svg>
      );

    case 'OR':
      return (
        <svg {...iconProps}>
          <path d="M8 12 Q16 12 24 12 Q36 12 36 24 Q36 36 24 36 Q16 36 8 36 Q12 24 8 12" />
          <path d="M2 18 H10 M2 30 H10 M36 24 H42" />
        </svg>
      );

    case 'NOT':
      return (
        <svg {...iconProps}>
          <path d="M8 12 L28 24 L8 36 Z" />
          <circle cx="32" cy="24" r="3" fill="none" />
          <path d="M2 24 H8 M35 24 H42" />
        </svg>
      );

    case 'NAND':
      return (
        <svg {...iconProps}>
          <path d="M8 12 H20 A12 12 0 0 1 20 36 H8 Z" />
          <circle cx="32" cy="24" r="3" fill="none" />
          <path d="M2 18 H8 M2 30 H8 M35 24 H42" />
        </svg>
      );

    case 'NOR':
      return (
        <svg {...iconProps}>
          <path d="M8 12 Q16 12 20 12 Q32 12 32 24 Q32 36 20 36 Q16 36 8 36 Q12 24 8 12" />
          <circle cx="35" cy="24" r="3" fill="none" />
          <path d="M2 18 H10 M2 30 H10 M38 24 H42" />
        </svg>
      );

    case 'XOR':
      return (
        <svg {...iconProps}>
          <path d="M12 12 Q20 12 24 12 Q36 12 36 24 Q36 36 24 36 Q20 36 12 36 Q16 24 12 12" />
          <path d="M8 12 Q12 24 8 36" />
          <path d="M2 18 H10 M2 30 H10 M36 24 H42" />
        </svg>
      );

    case 'CLOCK':
      return (
        <svg {...iconProps}>
          <rect x="8" y="16" width="8" height="8" />
          <rect x="16" y="16" width="8" height="16" />
          <rect x="24" y="24" width="8" height="8" />
          <rect x="32" y="16" width="8" height="16" />
          <path d="M40 24 H44" />
        </svg>
      );

    case 'SR_LATCH':
      return (
        <svg {...iconProps}>
          <rect x="12" y="12" width="24" height="24" rx="2" />
          <text x="14" y="20" fontSize="8" fill={color}>S</text>
          <text x="14" y="32" fontSize="8" fill={color}>R</text>
          <text x="28" y="20" fontSize="8" fill={color}>Q</text>
          <text x="26" y="32" fontSize="8" fill={color}>Q̄</text>
          <path d="M4 16 H12 M4 32 H12 M36 16 H42 M36 32 H42" />
        </svg>
      );

    case 'D_FF':
      return (
        <svg {...iconProps}>
          <rect x="12" y="12" width="24" height="24" rx="2" />
          <text x="14" y="22" fontSize="8" fill={color}>D</text>
          <text x="14" y="32" fontSize="8" fill={color}>CLK</text>
          <text x="28" y="22" fontSize="8" fill={color}>Q</text>
          <path d="M4 18 H12 M4 30 H12 M36 18 H42" />
          <path d="M12 30 L14 28 L12 26" strokeWidth="1" />
        </svg>
      );

    case 'HALF_ADDER':
      return (
        <svg {...iconProps}>
          <rect x="12" y="12" width="24" height="24" rx="2" />
          <text x="24" y="26" fontSize="10" fill={color} textAnchor="middle">HA</text>
          <path d="M4 18 H12 M4 30 H12 M36 18 H42 M36 30 H42" />
        </svg>
      );

    case 'FULL_ADDER':
      return (
        <svg {...iconProps}>
          <rect x="12" y="12" width="24" height="24" rx="2" />
          <text x="24" y="26" fontSize="10" fill={color} textAnchor="middle">FA</text>
          <path d="M4 16 H12 M4 24 H12 M4 32 H12 M36 18 H42 M36 30 H42" />
        </svg>
      );

    default:
      return (
        <svg {...iconProps}>
          <rect x="12" y="12" width="24" height="24" rx="2" />
          <text x="24" y="28" fontSize="14" fill={color} textAnchor="middle">?</text>
        </svg>
      );
  }
};

GateIcon.propTypes = {
  type: PropTypes.string.isRequired,
  size: PropTypes.number,
  color: PropTypes.string
};

export default GateIcon;