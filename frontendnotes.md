Your task is to implement a landing page, dashboard page, and analytics following the design + development brief below. Implement thoroughly, in a step-by-step manner, and use built-in, standard Tailwind CSS design tokens instead of hardcoding values.


For colors and font families, use the defined values present in


@tailwind.config.js, e.g. 'bg-primary-500' etc. instead of the hardcoded primary/secondary values in the JSON brief. For one-off colors/grays etc. the JSON values are acceptable.


Requirements
responsive (full width bg with centered content on larger screens)
theme aware components with light and dark mode support (you can toggle with @ThemeSwitch.tsx; make sure to include that in the menu bar)
update @data/config/colors.js to match the colors in the design brief
important make sure to include light and dark mode colors by using Tailwind's dark mode classes (dark:)
all components must adapt to theme changes
do not use magic strings, hex values, or px values. Replace all with Tailwind classes if possible.
split reusable or complex parts of the UI into components so the code is maintainable and easy to understand.
if any sample data is generated, place it in a separate file to keep the code clean.


Note
the app is already running a dev server
Implement it seamlessly so that the frontend and backend are wired well


Assignment
 Design and implement a polished web app UI for Cecurus, a privacy-first healthcare claims integrity platform for hospitals.


Create three cohesive experiences:
1. A landing page with a cinematic dark-teal hero, strong trust-building headline, concise supporting text, two clear CTAs, and a 3-item value strip.
2. A dashboard with a branded sidebar, top welcome area, 4 KPI summaries, a main rules chart, an issue breakdown donut, and a recent flags table.
3. An analytics page that extends the dashboard visual language with summary cards and deeper aggregate modules.


Use only two main palettes across the interface:
- Primary: teal/emerald family for brand, actions, active states, charts, highlights
- Secondary: neutral/slate family for text, surfaces, layout hierarchy


Use grays for structure and only a few semantic accents where necessary. Marketing surfaces may use rich teal gradients, glows, and branded illustration treatments. Product surfaces should remain cleaner, lighter, calmer, and more operational.


Keep the UI premium, secure, modern, and spacious:
- rounded shells and cards
- soft borders and subtle shadows
- clear typography hierarchy
- restrained motion
- high readability
- simple enterprise icons
- charts that feel elegant, not noisy


Support both light and dark mode. In light mode, use airy neutral surfaces with dark text and teal highlights. In dark mode, use deep slate/teal surfaces with soft glow accents and strong readability.


Responsive behavior:
- mobile: stack content vertically, collapse sidebar behavior, simplify tables
- tablet: reduce density and allow stacked analytics areas
- desktop: preserve the full shell layout with sidebar and multi-column analytics


Preserve the brand tone:
- trustworthy
- privacy-first
- hospital-safe
- efficient
- not flashy or overly playful



{
  // UI handoff brief derived from the supplied composite mockup image.
  // Some measurements are approximate because they are inferred visually.
  "meta": {
    "project": "Cecurus",
    "product_type": "Healthtech / claims integrity web app",
    "source_image": "Composite mockup containing landing page, dashboard, and analytics page",
    "design_intent": [
      "premium SaaS",
      "privacy-first",
      "healthcare operations",
      "clean, trustworthy, modern",
      "soft enterprise aesthetic rather than consumer playful"
    ],
    "visual_keywords": [
      "teal-green brand",
      "high contrast hero",
      "soft rounded cards",
      "glow gradients",
      "clean data widgets",
      "light surfaces",
      "dark hero media",
      "calm and secure"
    ],
    "confidence_notes": [
      "Typography family is inferred as a modern sans-serif similar to Inter, Manrope, or SF Pro.",
      "Some iconography and chart details are stylized placeholders and should be recreated in the same visual language rather than copied literally.",
      "Dark mode is not fully shown as a full UI system in the mockup, so dark mode guidance is extrapolated from the hero/header treatment and brand colors."
    ]
  },

  "design_system": {
    "theme_model": {
      "supported_modes": ["light", "dark"],
      "default_mode_recommendation": "light app shell with dark/immersive marketing hero",
      "brand_character": "Use dark, rich teal-greens for authority and trust. Use soft off-whites and pale grays for clarity and calm."
    },

    "breakpoints": {
      // Match Tailwind defaults
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px",
      "2xl": "1536px"
    },

    "spacing_scale_guidance": {
      "base_unit": 4,
      "rhythm": "Use consistent 4px rhythm. Main shells and sections should feel roomy rather than dense.",
      "section_padding_desktop": "48-80px",
      "section_padding_tablet": "32-48px",
      "section_padding_mobile": "20-24px",
      "card_padding": "20-28px",
      "tight_inline_padding": "10-14px"
    },

    "radius": {
      "small": "10-12px",
      "medium": "16-20px",
      "large": "24-28px",
      "pill": "9999px",
      "usage": {
        "buttons": "12-14px",
        "cards": "18-24px",
        "hero_shell": "28-32px",
        "badges_dropdowns": "pill or 12px",
        "tables_inside_cards": "12-16px row feel, not sharp"
      }
    },

    "stroke_and_border": {
      "light_mode": {
        "default": "1px solid neutral gray with low contrast",
        "emphasis": "brand-tinted border only for active or highlighted surfaces"
      },
      "dark_mode": {
        "default": "1px solid low-contrast teal/gray",
        "emphasis": "glow edge or slightly brighter teal border"
      }
    },

    "elevation": {
      "style": "soft ambient shadow, restrained, with subtle green-tinted glow in branded areas",
      "light_mode": {
        "cards": "very soft shadow, mostly separation through border + background contrast",
        "hero_cta": "slightly stronger shadow"
      },
      "dark_mode": {
        "cards": "more reliance on border + glow than heavy shadow",
        "panels": "soft teal bloom under featured elements"
      }
    },

    "motion": {
      "character": "minimal, polished, enterprise calm",
      "recommended_interactions": [
        "button hover lift 1-2px",
        "surface glow increase on hover",
        "chart and KPI fade-in",
        "sidebar item active highlight slide/fade",
        "table row highlight on hover"
      ],
      "avoid": [
        "bouncy motion",
        "high-energy exaggerated transitions",
        "gamified animation"
      ]
    }
  },

  "palette": {
    // Restricting to 2 main palettes plus grays/accents for complex media
    "primary": {
      "family_name": "Teal / Emerald",
      "intent": "brand, CTAs, charts, active states, secure/product identity",
      "tokens": {
        "50": "#E7F7F4",
        "100": "#CFEFE8",
        "200": "#A7E0D5",
        "300": "#73CBBE",
        "400": "#3FB4A3",
        "500": "#0D8A76",
        "600": "#0A7A68",
        "700": "#086657",
        "800": "#064F45",
        "900": "#033A33",
        "950": "#022B26"
      },
      "usage_rules": [
        "Use 500-700 for primary CTA, active nav, chart bars, focus accents.",
        "Use 50-100 for subtle tinted backgrounds and selected chips in light mode.",
        "Use 800-950 for dark hero backgrounds and dark mode shells."
      ]
    },

    "secondary": {
      "family_name": "Neutral / Slate-Warm Gray",
      "intent": "text, app surfaces, shells, contrast balance against green brand",
      "tokens": {
        "50": "#F8FAFA",
        "100": "#F1F4F4",
        "200": "#E6EBEB",
        "300": "#D6DDDD",
        "400": "#B7C0C0",
        "500": "#8C9798",
        "600": "#667172",
        "700": "#495354",
        "800": "#2E3738",
        "900": "#1A2021",
        "950": "#0B1011"
      },
      "usage_rules": [
        "Use 50-100 for app background and light cards.",
        "Use 700-950 for text hierarchy.",
        "Use 800-950 in dark mode for shells and background planes."
      ]
    },

    "grays": {
      "canvas_light": "#F3F5F5",
      "card_light": "#FBFCFC",
      "line_light": "#E5EBEA",
      "text_strong": "#1F2A2B",
      "text_muted": "#667273",
      "canvas_dark": "#071313",
      "card_dark": "#0D1B1B",
      "line_dark": "#183232",
      "text_dark_strong": "#F5F7F7",
      "text_dark_muted": "#AAB8B8"
    },

    "accents": {
      "success": "#1E9E74",
      "info": "#2B8ED6",
      "warning": "#D4A72C",
      "danger": "#D85B5B"
    },

    "complex_media": {
      "hero_gradient_dark": [
        "#021715",
        "#03302B",
        "#0A5A50"
      ],
      "sidebar_gradient_dark": [
        "#031D1A",
        "#06362F",
        "#052822"
      ],
      "teal_glow": "rgba(20, 173, 150, 0.22)",
      "soft_white_glow": "rgba(255,255,255,0.08)",
      "hero_overlay": "Use layered radial glows and soft vignette rather than flat fill",
      "chart_palette": [
        "#0D8A76",
        "#5FC8BC",
        "#A7E0D5",
        "#D7F1ED"
      ]
    }
  },

  "typography": {
    "font_style": "clean geometric-humanist sans",
    "tone": "confident, high legibility, calm",
    "weights": {
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "scale": {
      "hero_title_desktop": "56-64px / 1.05-1.1",
      "hero_title_tablet": "40-48px / 1.1",
      "hero_title_mobile": "30-36px / 1.15",
      "page_title_desktop": "40-48px / 1.15",
      "section_title": "28-32px / 1.2",
      "card_title": "18-22px / 1.3",
      "kpi_value": "36-44px / 1.1",
      "body_large": "18-20px / 1.5",
      "body": "15-17px / 1.5-1.7",
      "small": "13-14px / 1.45",
      "caption": "12px / 1.4"
    },
    "text_treatment": {
      "headings": "Mostly sentence case, bold/semibold, high contrast",
      "logo_wordmark": "all caps or visually wide uppercase styling",
      "kpis": "large numeric emphasis with muted labels above",
      "table_headers": "small semibold, muted color"
    }
  },

  "layout": {
    "overall_composition": {
      "format": "Stacked presentation of 3 key screens",
      "page_width_behavior": "Centered max-width container with large outer margins on desktop",
      "desktop_max_content_width": "Approx. 1200-1440px",
      "shell_shape": "rounded, premium cards/surfaces rather than full-bleed app shell"
    },

    "marketing_vs_product": {
      "landing_page": "immersive, visual, emotionally branded",
      "dashboard_and_analytics": "functional, restrained, whitespace-driven, operational"
    },

    "app_shell_pattern": {
      "sidebar": "fixed-width vertical left sidebar",
      "main_content": "top bar + KPI row + content grids + table modules",
      "surface_strategy": "main shell on very light neutral background with white cards"
    }
  },

  "screens": {
    "landing_page": {
      "purpose": "Introduce product value quickly and convert users to sign up or get started.",
      "visual_structure": {
        "container": "Large rounded dark hero shell",
        "split": "Two-column layout on desktop",
        "left_column": "headline, subheadline, CTAs",
        "right_column": "brand illustration / secure-tech montage",
        "bottom_band": "3 feature highlights on a darker translucent strip",
        "footer_chip": "small centered copyright/privacy pill"
      },
      "sections": {
        "hero": {
          "background": "Dark teal cinematic gradient with vignette and glow",
          "left_content": {
            "headline": "Privacy-First Claims Integrity for Hospitals",
            "subheadline": "Detect duplicate and overlapping healthcare claims before they leave the hospital system.",
            "cta_row": [
              {
                "label": "Get Started",
                "style": "primary filled"
              },
              {
                "label": "Sign Up",
                "style": "secondary light filled"
              }
            ]
          },
          "right_content": {
            "type": "abstract product illustration",
            "elements": [
              "large shield mark with C-shaped path",
              "floating software panels",
              "healthcare cross icon",
              "ambient plant/device silhouettes",
              "soft layered glow and depth haze"
            ],
            "implementation_note": "Treat as branded hero media, not literal UI screenshot."
          }
        },

        "feature_strip": {
          "layout": "3 columns desktop, stacked mobile",
          "card_style": "inline icon + text block, transparent on branded strip",
          "items": [
            {
              "title": "Detect Duplicate Claims",
              "body": "Identify duplicate and overlapping claims before they're sent."
            },
            {
              "title": "Reduce Admin Waste",
              "body": "Prevent costly claim errors and reduce resubmissions."
            },
            {
              "title": "Maintain Data Privacy",
              "body": "Keep all protected health information securely on-premise."
            }
          ]
        },

        "footer_chip": {
          "style": "small pill floating over lower edge",
          "content": [
            "© 2024 Cecurus. All rights reserved",
            "Privacy Policy"
          ]
        }
      },
      "component_notes": {
        "buttons": {
          "primary": "dark teal fill, white label, moderate horizontal padding",
          "secondary": "off-white fill, dark text, minimal border"
        },
        "feature_icons": "line/duotone icons in teal glow circles"
      }
    },

    "dashboard": {
      "purpose": "Operational overview of claims processed, flag counts, exposure, breakdowns, and recent flags.",
      "visual_structure": {
        "shell": "Rounded light app window",
        "sidebar": "dark branded gradient",
        "header": "page title left, welcome/user area right",
        "content_flow": [
          "KPI row",
          "2-column analytics row",
          "Recent flags table"
        ]
      },

      "sidebar": {
        "width_desktop": "Approx. 220-260px",
        "branding": "logo mark + wordmark at top",
        "nav_items": [
          "Dashboard",
          "Claim Flags",
          "Settings"
        ],
        "active_state": "translucent teal highlight with subtle glow",
        "icon_style": "simple filled/line icons, white or pale teal"
      },

      "topbar": {
        "title": "Dashboard",
        "right_side": {
          "welcome_text": "Welcome, Tracy",
          "avatar": "small circular user avatar"
        }
      },

      "kpi_row": {
        "layout": "4 evenly divided metric cards inside one large grouped surface",
        "metrics": [
          {
            "label": "Total Claims Processed",
            "value": "2,485"
          },
          {
            "label": "Duplicate Flags",
            "value": "112"
          },
          {
            "label": "Financial Exposure",
            "value": "$128K"
          },
          {
            "label": "Manual Reviews Reduced",
            "value": "45%↓"
          }
        ],
        "style": {
          "background": "white / near-white",
          "dividers": "subtle vertical separators",
          "micro_visuals": "tiny area-chart or sparkline hints under some values"
        }
      },

      "analytics_row": {
        "layout": "left large chart card, right smaller donut card",
        "left_card": {
          "title": "Flagged Claims by Rule",
          "controls": [
            "Past Week dropdown",
            "All Statuses dropdown",
            "All Rules dropdown"
          ],
          "chart_style": "teal bar/area hybrid with pale comparative background area"
        },
        "right_card": {
          "title": "Issue Breakdown",
          "chart_style": "donut chart",
          "side_labels": [
            "50%",
            "30%",
            "20%"
          ],
          "note": "Labels likely correspond to different rule categories"
        }
      },

      "recent_flags_table": {
        "title": "Recent Flags",
        "toolbar": [
          "All Statuses dropdown",
          "All Rules dropdown",
          "View dropdown"
        ],
        "columns": [
          "Claim ID",
          "Date",
          "Patient ID",
          "Rule Triggered",
          "Status",
          "Action"
        ],
        "rows_style": {
          "height": "comfortable, not dense",
          "striping": "very subtle alternating neutral background",
          "hover": "light teal tint"
        },
        "actions": {
          "status_button": "rounded filled teal chip labeled View in mockup, likely should be status/action distinction",
          "secondary_action": "outlined or low-emphasis button"
        }
      }
    },

    "analytics": {
      "purpose": "Deeper aggregate metrics and trend analysis.",
      "structure": {
        "shell": "Same as dashboard shell and sidebar",
        "header": "Analytics title + user area",
        "upper_metrics": "3 compact summary cards",
        "lower_grid": "larger analytics modules"
      },

      "summary_cards": [
        {
          "label": "Duplicate Claims Reduced",
          "value": "112",
          "icon": "badge/counter icon"
        },
        {
          "label": "Financial Exposure",
          "value": "$128,500",
          "icon": "money/bag icon"
        },
        {
          "label": "Claim Resubmissions Reduced",
          "value": "78",
          "icon": "briefcase/task icon"
        }
      ],

      "lower_modules": [
        {
          "title": "Aggregate Metrics",
          "type": "table or summary list card"
        },
        {
          "title": "Flagged Claims Breakdown",
          "type": "chart card"
        }
      ],

      "consistency_rule": "Analytics page should feel like an extension of dashboard, not a different product."
    }
  },

  "components": {
    "logo": {
      "symbol": "shield outline containing a large C form with two endpoint dots and one horizontal center line",
      "usage": {
        "light_bg": "teal symbol",
        "dark_bg": "white symbol",
        "wordmark": "teal-highlighted internal letters where desired"
      }
    },

    "buttons": {
      "sizes": {
        "sm": "36-40px height",
        "md": "44-48px height",
        "lg": "52-56px height"
      },
      "variants": {
        "primary": {
          "light_mode": "primary.600 background, white text",
          "dark_mode": "primary.500 background, white text"
        },
        "secondary": {
          "light_mode": "white or secondary.50 background, dark text, subtle border",
          "dark_mode": "secondary.800 background, white text, low-contrast border"
        },
        "ghost": {
          "light_mode": "transparent with muted text",
          "dark_mode": "transparent with pale text"
        },
        "chip": {
          "usage": "filters, status selectors, nav active, inline badges"
        }
      }
    },

    "cards": {
      "base": {
        "light_mode": "secondary.50 or white with subtle border",
        "dark_mode": "secondary.900 or primary.950 mix with faint border"
      },
      "featured": {
        "usage": "KPI groups, hero features, active filters",
        "accent": "soft teal tint or glow"
      }
    },

    "inputs_and_dropdowns": {
      "style": "rounded pills or soft rectangles, low-contrast border, minimal chrome",
      "states": [
        "default",
        "hover",
        "focus",
        "disabled"
      ],
      "focus": "teal ring/glow, never bright blue default"
    },

    "charts": {
      "style": "rounded, clean, presentation-friendly",
      "bar_chart": "teal bars with pale teal area background",
      "donut_chart": "3-4 teal tones with generous inner hole",
      "labels": "outside or adjacent, muted support text"
    },

    "table": {
      "container": "card inside shell",
      "header": "small muted label row",
      "cells": "15-16px text, generous vertical spacing",
      "row_dividers": "minimal",
      "selection": "teal tint or left accent line"
    },

    "avatar": {
      "size": "32-40px",
      "shape": "circle",
      "style": "flat illustration / simple profile graphic"
    },

    "icons": {
      "style": "simple, enterprise, line or lightly filled",
      "stroke_weight": "medium",
      "color_behavior": "brand-tinted on emphasis, muted in secondary contexts"
    }
  },

  "light_mode": {
    "backgrounds": {
      "app_canvas": "secondary.100 / custom canvas_light",
      "shell": "#F6F8F8",
      "card": "#FFFFFF"
    },
    "text": {
      "primary": "secondary.900",
      "secondary": "secondary.600",
      "inverse": "#FFFFFF"
    },
    "navigation": {
      "sidebar": "dark branded gradient maintained even in light mode",
      "active_item": "translucent teal highlight",
      "inactive_item": "white / off-white at reduced opacity"
    },
    "data_visualization": {
      "base": "light neutral gridlines",
      "series": "teal family only"
    }
  },

  "dark_mode": {
    "goal": "Preserve premium secure-health feel without losing legibility.",
    "backgrounds": {
      "app_canvas": "secondary.950",
      "shell": "secondary.900",
      "card": "secondary.900 to primary.950 blend",
      "nested_card": "secondary.800 / primary.950"
    },
    "text": {
      "primary": "secondary.50",
      "secondary": "secondary.300",
      "muted": "secondary.400"
    },
    "navigation": {
      "sidebar": "primary.950 with subtle teal bloom",
      "active_item": "primary.700/800 translucent pill",
      "inactive_item": "secondary.200"
    },
    "cards_and_borders": {
      "border": "rgba(167, 224, 213, 0.08) or similar",
      "shadow": "soft teal haze, not black-heavy"
    },
    "charts": {
      "gridlines": "low-contrast muted teal-gray",
      "series": "teal 300-600 on dark backgrounds",
      "labels": "secondary.200"
    },
    "buttons": {
      "primary": "primary.500 fill, white text",
      "secondary": "secondary.800 fill, secondary.50 text, low border"
    }
  },

  "responsive_behavior": {
    "sm_and_below": {
      "landing_page": [
        "Collapse hero to single column.",
        "Place illustration below text.",
        "Stack CTA buttons vertically or allow 2-up if width permits.",
        "Convert 3 feature items to vertical stack."
      ],
      "app_shell": [
        "Hide persistent sidebar; use top app bar + drawer or bottom nav if needed.",
        "KPI cards become 2x2 grid or vertical stack.",
        "Charts stack vertically.",
        "Table should become horizontally scrollable or convert to card list."
      ]
    },

    "md": {
      "landing_page": [
        "Two columns can remain if illustration scales down safely.",
        "Feature strip can be 2 + 1 wrap or 3 condensed columns."
      ],
      "dashboard": [
        "Sidebar may remain collapsed/icon-only or drawer.",
        "KPI row becomes 2 columns x 2 rows.",
        "Chart and donut likely stack."
      ]
    },

    "lg": {
      "landing_page": [
        "Full two-column hero.",
        "Feature strip in 3 columns."
      ],
      "dashboard": [
        "Full sidebar visible.",
        "KPI row in 4 columns.",
        "Main chart + donut in 2-column layout."
      ]
    },

    "xl_and_2xl": {
      "behavior": [
        "Increase whitespace before increasing density.",
        "Keep content centered within max width.",
        "Do not stretch tables or charts excessively without adding breathing room."
      ]
    }
  },

  "content_and_messaging": {
    "brand_positioning": "Privacy-first claims integrity for hospitals",
    "supporting_messages": [
      "Detect duplicate and overlapping healthcare claims before they leave the hospital system.",
      "Reduce admin waste.",
      "Maintain data privacy.",
      "Flagged claims by rule.",
      "Financial exposure.",
      "Claim resubmissions reduced."
    ],
    "tone_of_voice": [
      "clear",
      "credible",
      "operationally useful",
      "healthcare-safe",
      "not hype-heavy"
    ]
  },

  "implementation_rules": {
    "token_usage": [
      "Use only the two main color families for most UI decisions: primary and secondary.",
      "Reserve accent colors for semantic states or complex data visualization only.",
      "Avoid introducing unrelated saturated colors.",
      "Use grays for layout hierarchy; use primary for meaning and action.",
      "In marketing surfaces, allow richer gradients and glows; in product surfaces, keep backgrounds flatter and cleaner."
    ],
    "composition_rules": [
      "Favor large rounded containers over hard-edged sections.",
      "Give dashboards generous whitespace and calm grouping.",
      "Keep CTA hierarchy obvious and sparse.",
      "Use charts decoratively but legibly; never overcrowd."
    ],
    "do_not": [
      "Do not overuse shadows.",
      "Do not use harsh pure black except sparingly in dark mode accents.",
      "Do not make tables dense or spreadsheet-like.",
      "Do not add unrelated bright brand colors."
    ]
  },

  "developer_prompt": "See Markdown code block below."
}