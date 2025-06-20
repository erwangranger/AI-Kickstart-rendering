import React, { useState, useEffect } from 'react';
import { fetchKickstarts, getAllCategories, forceRefreshKickstarts, fetchRepoStats } from './api/kickstarts';
import { BASE_PATH } from './api/kickstarts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// NOTE: Direct imports of PatternFly React components like '@patternfly/react-core'
// and '@patternfly/react-icons' are causing resolution errors in this self-contained
// environment. To make this prototype runnable, we will implement the UI using standard
// HTML elements and apply custom CSS classes that mimic PatternFly's design system.
// Icons will be replaced with inline SVGs or unicode characters as needed.

// Inline CSS to mimic PatternFly's look and feel without direct imports.
// This provides the necessary styling for the HTML elements.
const customPatternFlyStyle = `
  :root {
    --pf-global--spacer--xs: 0.25rem;
    --pf-global--spacer--sm: 0.5rem;
    --pf-global--spacer--md: 1rem;
    --pf-global--spacer--lg: 1.5rem;
    --pf-global--spacer--xl: 2rem;
    --pf-global--spacer--2xl: 3rem;

    --pf-global--BorderWidth--sm: 1px;
    --pf-global--BorderRadius--lg: 0.5rem; /* Increased from 0.25rem to 0.5rem for more rounded corners */
    --pf-global--BorderColor--100: #d2d2d2;
    --pf-global--BorderColor--200: #8a8d90;

    --pf-global--FontSize--sm: 0.875rem;
    --pf-global--FontSize--lg: 1.125rem;
    --pf-global--FontSize--xl: 1.25rem;
    --pf-global--FontSize--2xl: 1.5rem; /* Adjusted for h1 */

    --pf-global--FontWeight--normal: 400;
    --pf-global--FontWeight--bold: 700;

    --pf-global--BackgroundColor--100: #f0f0f0; /* Light gray for sections */
    --pf-global--BackgroundColor--200: #fafafa;
    --pf-global--BackgroundColor--300: #e0e0e0; /* Hover state for select items */

    --pf-global--primary-color--100: #cc0000; /* Changed to red */
    --pf-global--primary-color--200: #990000; /* Darker red for hover */
    --pf-global--active-color--100: #cc0000; /* Changed to red */

    --pf-global--BoxShadow--sm: 0 0.0625rem 0.125rem rgba(3,3,3,0.1), 0 0.125rem 0.25rem rgba(3,3,3,0.1);
    --pf-global--BoxShadow--md: 0 0.125rem 0.25rem rgba(3,3,3,0.1), 0 0.25rem 0.5rem rgba(3,3,3,0.1);
    --pf-global--BoxShadow--lg: 0 0.25rem 0.5rem rgba(3,3,3,0.1), 0 0.5rem 1rem rgba(3,3,3,0.1);

    font-family: 'Inter', sans-serif; /* Fallback to sans-serif */
  }

  body {
    margin: 0;
    background-color: #f0f0f0; /* Page background */
  }

  .pf-v5-c-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Masthead Styles */
  .pf-v5-c-masthead {
    background-color: #000000; /* Changed from #be0000 to black */
    color: white;
    padding: var(--pf-global--spacer--md) var(--pf-global--spacer--xl);
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: var(--pf-global--BoxShadow--sm);
  }
  .pf-v5-c-masthead__main {
    display: flex;
    align-items: center;
  }
  .pf-v5-c-masthead__brand {
    display: flex;
    align-items: center;
  }
  .pf-v5-c-brand {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: white;
  }
  .pf-v5-c-brand img {
    height: 30px; /* Adjust as needed */
    margin-right: var(--pf-global--spacer--sm);
  }
  .pf-v5-c-brand span {
    color: white;
  }
  .pf-v5-u-font-weight-bold { font-weight: var(--pf-global--FontWeight--bold); }
  .pf-v5-u-font-size-2xl { font-size: var(--pf-global--FontSize--2xl); }
  .pf-v5-u-font-size-xl { font-size: var(--pf-global--FontSize--xl); }
  .pf-v5-u-ml-sm { margin-left: var(--pf-global--spacer--sm); }

  /* Page Section Styles */
  .pf-v5-c-page__main-section {
    padding: var(--pf-global--spacer--xl);
    background-color: white; /* Default light background */
  }
  .pf-v5-c-page__main-section.pf-m-light {
    background-color: var(--pf-global--BackgroundColor--100);
  }
  .pf-v5-u-py-xl { padding-top: var(--pf-global--spacer--xl); padding-bottom: var(--pf-global--spacer--xl); }
  .pf-v5-u-text-align-center { text-align: center; }
  .pf-v5-u-pb-lg { padding-bottom: var(--pf-global--spacer--lg); }
  .pf-v5-c-title {
    font-size: var(--pf-global--FontSize--2xl);
    font-weight: var(--pf-global--FontWeight--bold);
    color: #333;
    margin-top: 0;
    margin-bottom: var(--pf-global--spacer--md);
  }
  .pf-v5-u-mt-md { margin-top: var(--pf-global--spacer--md); }

  /* Toolbar Styles */
  .pf-v5-c-toolbar {
    display: flex;
    justify-content: center;
    margin-bottom: var(--pf-global--spacer--lg);
  }
  .pf-v5-c-toolbar__content {
    display: flex;
    gap: var(--pf-global--spacer--md);
    flex-wrap: wrap; /* Allow wrapping on smaller screens */
    align-items: center;
    max-width: 900px; /* Limit toolbar width */
    width: 100%;
  }
  .pf-v5-c-toolbar__item {
    flex-grow: 1; /* Allow items to grow */
    min-width: 200px; /* Minimum width for inputs/selects */
  }
  .pf-v5-c-text-input-group {
    display: flex;
    align-items: center;
    border: var(--pf-global--BorderWidth--sm) solid var(--pf-global--BorderColor--200);
    border-radius: var(--pf-global--BorderRadius--lg);
    padding: var(--pf-global--spacer--sm);
    background-color: white;
  }
  .pf-v5-c-text-input-group__text-input {
    border: none;
    outline: none;
    flex-grow: 1;
    padding: 0 var(--pf-global--spacer--sm);
    font-size: var(--pf-global--FontSize--sm);
  }
  .pf-v5-c-button.pf-m-control {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 var(--pf-global--spacer--sm);
    color: var(--pf-global--BorderColor--200);
  }
  .pf-v5-c-button.pf-m-control:hover {
    color: #333;
  }

  /* Select/Dropdown Styles */
  .pf-v5-c-select {
    position: relative;
    width: 100%;
  }
  .pf-v5-c-select__toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: var(--pf-global--spacer--sm);
    border: var(--pf-global--BorderWidth--sm) solid var(--pf-global--BorderColor--200);
    border-radius: var(--pf-global--BorderRadius--lg);
    background-color: white;
    cursor: pointer;
    font-size: var(--pf-global--FontSize--sm);
    text-align: left;
  }
  .pf-v5-c-select__toggle:hover {
    border-color: var(--pf-global--primary-color--100);
  }
  .pf-v5-c-select__toggle-arrow {
    margin-left: var(--pf-global--spacer--sm);
    transition: transform 0.2s ease-in-out;
  }
  .pf-v5-c-select__toggle[aria-expanded="true"] .pf-v5-c-select__toggle-arrow {
    transform: rotate(180deg);
  }
  .pf-v5-c-select__menu {
    position: absolute;
    width: 100%;
    background-color: white;
    border: var(--pf-global--BorderWidth--sm) solid var(--pf-global--BorderColor--100);
    border-radius: var(--pf-global--BorderRadius--lg);
    box-shadow: var(--pf-global--BoxShadow--sm);
    z-index: 10;
    margin-top: var(--pf-global--spacer--xs);
    max-height: 200px;
    overflow-y: auto;
    list-style: none; /* Remove default list bullets */
    padding: 0;
  }
  .pf-v5-c-select__menu-item {
    padding: var(--pf-global--spacer--sm) var(--pf-global--spacer--md);
    cursor: pointer;
    font-size: var(--pf-global--FontSize--sm);
  }
  .pf-v5-c-select__menu-item:hover {
    background-color: var(--pf-global--BackgroundColor--300);
  }

  /* Gallery/Card Layout */
  .pf-v5-c-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Adjusted min-width for better spacing */
    gap: var(--pf-global--spacer--lg);
    padding-bottom: var(--pf-global--spacer--xl); /* Ensure space at bottom of page */
  }

  /* Card Styles */
  .pf-v5-c-card {
    background-color: white;
    border: var(--pf-global--BorderWidth--sm) solid var(--pf-global--BorderColor--100);
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06); /* Enhanced shadow effect */
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    transition: box-shadow 0.2s ease-in-out;
  }
  .pf-v5-c-card.pf-m-hoverable:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08); /* Enhanced hover shadow */
  }
  .pf-v5-c-card__title {
    padding: var(--pf-global--spacer--lg);
    font-size: var(--pf-global--FontSize--lg);
    font-weight: var(--pf-global--FontWeight--bold);
    color: #333;
  }
  .pf-v5-c-card__title h3 { /* Ensure h3 inside title has correct styling */
    margin: 0;
    font-size: inherit;
    font-weight: inherit;
  }
  .pf-v5-c-card__body {
    padding: 0 var(--pf-global--spacer--lg) var(--pf-global--spacer--lg);
    flex-grow: 1;
    font-size: var(--pf-global--FontSize--sm);
    color: #6a6e73;
  }
  .pf-v5-c-card__footer {
    padding: var(--pf-global--spacer--lg);
    border-top: var(--pf-global--BorderWidth--sm) solid var(--pf-global--BorderColor--100);
    display: flex;
    flex-wrap: wrap;
    gap: var(--pf-global--spacer--sm);
    padding-top: var(--pf-global--spacer--md);
    align-items: flex-end; /* Align button to bottom */
  }
  .pf-v5-c-label {
    display: inline-flex;
    align-items: center;
    padding: var(--pf-global--spacer--xs) var(--pf-global--spacer--sm);
    border-radius: var(--pf-global--BorderRadius--lg);
    font-size: var(--pf-global--FontSize--sm);
  }
  .pf-v5-c-label.pf-m-outline.pf-m-blue {
    border: var(--pf-global--BorderWidth--sm) solid var(--pf-global--active-color--100);
    color: var(--pf-global--active-color--100);
    background-color: transparent;
  }
  .pf-v5-c-button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: var(--pf-global--spacer--sm) var(--pf-global--spacer--lg);
    border-radius: var(--pf-global--BorderRadius--lg);
    cursor: pointer;
    font-size: var(--pf-global--FontSize--sm);
    font-weight: var(--pf-global--FontWeight--bold);
    text-decoration: none; /* For <a> tags styled as buttons */
    transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }
  .pf-v5-c-button.pf-m-primary {
    background-color: var(--pf-global--primary-color--100);
    color: white;
    border: none;
  }
  .pf-v5-c-button.pf-m-primary:hover {
    background-color: var(--pf-global--primary-color--200);
    box-shadow: var(--pf-global--BoxShadow--sm);
  }
  .w-full {
    width: 100%;
  }

  /* Empty State / Loading State */
  .pf-v5-c-empty-state {
    text-align: center;
    padding: var(--pf-global--spacer--2xl);
    background-color: white;
    border-radius: var(--pf-global--BorderRadius--lg);
    box-shadow: var(--pf-global--BoxShadow--sm);
    margin: var(--pf-global--spacer--xl) auto;
    max-width: 600px;
  }
  .pf-v5-c-empty-state__icon {
    margin-bottom: var(--pf-global--spacer--md);
    color: #6a6e73; /* Default icon color */
  }
  .pf-v5-c-empty-state__body {
    font-size: var(--pf-global--FontSize--sm);
    color: #6a6e73;
  }
  .pf-v5-c-spinner {
    --spinner-size: 50px;
    border: 5px solid rgba(0, 0, 0, 0.1);
    border-top: 5px solid var(--pf-global--primary-color--100);
    border-radius: 50%;
    width: var(--spinner-size);
    height: var(--spinner-size);
    animation: spin 1s linear infinite;
    display: inline-block;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .pf-v5-c-cubes-icon { /* Custom style for CubesIcon if it doesn't resolve */
    font-size: 3rem; /* Adjust size for the icon */
  }

  .pf-v5-c-select__menu-item.pf-m-selected {
    background-color: var(--pf-global--BackgroundColor--300);
    font-weight: var(--pf-global--FontWeight--bold);
  }

  .pf-v5-c-button.pf-m-secondary {
    background-color: white;
    color: var(--pf-global--primary-color--100);
    border: var(--pf-global--BorderWidth--sm) solid var(--pf-global--primary-color--100);
  }

  .pf-v5-c-button.pf-m-secondary:hover {
    background-color: var(--pf-global--BackgroundColor--300);
  }

  .kickstart-title-link:hover {
    color: var(--pf-global--link--Color--hover) !important;
    text-decoration: none !important;
  }

  /* Footer Styles */
  .pf-v5-c-footer {
    background-color: var(--pf-global--BackgroundColor--200);
    border-top: var(--pf-global--BorderWidth--sm) solid var(--pf-global--BorderColor--100);
    padding: var(--pf-global--spacer--lg) var(--pf-global--spacer--xl);
    margin-top: auto;
  }
  .pf-v5-c-footer__content {
    display: flex;
    justify-content: flex-start; /* Align content to the left */
    align-items: center;
    max-width: 1200px;
    /* margin: 0 auto; Removed to allow left alignment within footer padding */
    font-size: var(--pf-global--FontSize--sm);
    color: var(--pf-global--Color--200);
  }
  .pf-v5-c-footer__link {
    color: var(--pf-global--primary-color--100);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: var(--pf-global--spacer--xs);
  }
  .pf-v5-c-footer__link:hover {
    text-decoration: underline;
  }
  .pf-v5-c-footer__stats {
    display: flex;
    gap: var(--pf-global--spacer--md);
  }
  .pf-v5-c-footer__stat {
    display: flex;
    align-items: center;
    gap: var(--pf-global--spacer--xs);
  }
  .pf-v5-c-footer__stat-icon {
    color: var(--pf-global--Color--200);
  }

  /* Markdown Styles */
  .markdown-preview {
    font-size: var(--pf-global--FontSize--sm);
    color: var(--pf-global--Color--100);
    line-height: 1.5;
    border: var(--pf-global--BorderWidth--sm) solid var(--pf-global--BorderColor--100);
    border-radius: var(--pf-global--BorderRadius--lg);
    padding: var(--pf-global--spacer--md);
    background-color: var(--pf-global--BackgroundColor--200);
    margin-bottom: var(--pf-global--spacer--md);
  }
  .markdown-preview h1,
  .markdown-preview h2,
  .markdown-preview h3,
  .markdown-preview h4,
  .markdown-preview h5,
  .markdown-preview h6 {
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: var(--pf-global--FontWeight--bold);
  }
  .markdown-preview h1 { font-size: 1.5em; }
  .markdown-preview h2 { font-size: 1.3em; }
  .markdown-preview h3 { font-size: 1.1em; }
  .markdown-preview h4 { font-size: 1em; }
  .markdown-preview h5 { font-size: 0.9em; }
  .markdown-preview h6 { font-size: 0.8em; }
  .markdown-preview p {
    margin: 0.5em 0;
  }
  .markdown-preview ul,
  .markdown-preview ol {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }
  .markdown-preview li {
    margin: 0.25em 0;
  }
  .markdown-preview code {
    background-color: var(--pf-global--BackgroundColor--200);
    padding: 0.1em 0.3em;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
  }
  .markdown-preview pre {
    background-color: var(--pf-global--BackgroundColor--200);
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0.5em 0;
  }
  .markdown-preview pre code {
    background-color: transparent;
    padding: 0;
  }
  .markdown-preview blockquote {
    border-left: 3px solid var(--pf-global--BorderColor--200);
    margin: 0.5em 0;
    padding-left: 1em;
    color: var(--pf-global--Color--200);
  }
  .markdown-preview a {
    color: var(--pf-global--primary-color--100);
    text-decoration: none;
  }
  .markdown-preview a:hover {
    text-decoration: underline;
  }
  .markdown-preview img {
    max-width: 100%;
    height: auto;
  }
  .markdown-preview table {
    border-collapse: collapse;
    width: 100%;
    margin: 0.5em 0;
  }
  .markdown-preview th,
  .markdown-preview td {
    border: 1px solid var(--pf-global--BorderColor--200);
    padding: 0.5em;
    text-align: left;
  }
  .markdown-preview th {
    background-color: var(--pf-global--BackgroundColor--200);
    font-weight: var(--pf-global--FontWeight--bold);
  }
  .markdown-preview hr {
    border: none;
    border-top: 1px solid var(--pf-global--BorderColor--200);
    margin: 1em 0;
  }
`;

// Replaced PatternFly React components with HTML elements and custom CSS classes
const KickstartCard = ({ kickstart }) => (
  <div className="pf-v5-c-card pf-m-hoverable">
    <div className="pf-v5-c-card__title">
      <h3>
        <a
          href={`${kickstart.githubLink}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--pf-global--link--Color)',
            textDecoration: 'underline',
            transition: 'color 0.2s ease-in-out',
            ':hover': {
              color: 'var(--pf-global--link--Color--hover)',
              textDecoration: 'none'
            }
          }}
          className="kickstart-title-link"
        >
          {kickstart.title}
        </a>
      </h3>
    </div>
    <div className="pf-v5-c-card__body">
      {/* Description section */}
      <div className="kickstart-description">
        <h4 style={{
          fontSize: 'var(--pf-global--FontSize--sm)',
          color: 'var(--pf-global--Color--200)',
          marginBottom: 'var(--pf-global--spacer--xs)'
        }}>
          Description
        </h4>
        <p style={{ marginBottom: 'var(--pf-global--spacer--md)' }}>
          {kickstart.description}
        </p>
      </div>

      {/* README preview section */}
      <div className="kickstart-readme">
        <h4 style={{
          fontSize: 'var(--pf-global--FontSize--sm)',
          color: 'var(--pf-global--Color--200)',
          marginBottom: 'var(--pf-global--spacer--xs)'
        }}>
          README Preview
        </h4>
        <div className="markdown-preview">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Ensure headings have content and are accessible
              h1: ({node, children, ...props}) => <h3 {...props}>{children || 'Heading 1'}</h3>,
              h2: ({node, children, ...props}) => <h4 {...props}>{children || 'Heading 2'}</h4>,
              h3: ({node, children, ...props}) => <h5 {...props}>{children || 'Heading 3'}</h5>,
              // Disable images in preview
              img: () => null,
              // Ensure anchors have content and are accessible
              a: ({node, children, ...props}) => (
                <a {...props} target="_blank" rel="noopener noreferrer">
                  {children || props.href || 'Link'}
                </a>
              ),
            }}
          >
            {kickstart.readmePreview}
          </ReactMarkdown>
        </div>
      </div>

      {/* Metadata section */}
      <div style={{
        marginTop: 'var(--pf-global--spacer--md)',
        fontSize: 'var(--pf-global--FontSize--sm)',
        color: 'var(--pf-global--Color--200)'
      }}>
        <small>Last updated: {kickstart.lastUpdated}</small>
        {kickstart.stars > 0 && (
          <span style={{ marginLeft: 'var(--pf-global--spacer--md)' }}>
            ⭐ {kickstart.stars} stars
          </span>
        )}
      </div>
    </div>
    <div className="pf-v5-c-card__footer">
      {kickstart.categories.map((category, index) => (
        <span
          key={index}
          className="pf-v5-c-label pf-m-outline pf-m-blue"
        >
          {category}
        </span>
      ))}
      <a
        href={kickstart.githubLink.replace('#readme', '')}
        target="_blank"
        rel="noopener noreferrer"
        className="pf-v5-c-button pf-m-primary pf-m-sm"
        role="button"
        style={{
          fontSize: 'var(--pf-global--FontSize--sm)',
          padding: 'var(--pf-global--spacer--xs) var(--pf-global--spacer--sm)',
          marginTop: 'var(--pf-global--spacer--sm)'
        }}
      >
        View on GitHub
      </a>
    </div>
  </div>
);

const App = () => {
  const [kickstarts, setKickstarts] = useState([]);
  const [filteredKickstarts, setFilteredKickstarts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCategorySelectOpen, setIsCategorySelectOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [repoStats, setRepoStats] = useState({ stars: 0, forks: 0, url: '' });

  // Fetch kickstarts data with caching
  useEffect(() => {
    const loadKickstarts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchKickstarts();
        setKickstarts(data.kickstarts);
        setFilteredKickstarts(data.kickstarts);
        setCategories(getAllCategories(data.kickstarts));
      } catch (err) {
        setError(err.message);
        console.error('Failed to load kickstarts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadKickstarts();
  }, []);

  // Handle background refresh
  useEffect(() => {
    let mounted = true;

    const handleBackgroundRefresh = async () => {
      try {
        setIsRefreshing(true);
        const data = await forceRefreshKickstarts();
        if (mounted) {
          setKickstarts(data.kickstarts);
          setFilteredKickstarts(data.kickstarts);
          setCategories(getAllCategories(data.kickstarts));
        }
      } catch (err) {
        console.error('Background refresh failed:', err);
      } finally {
        if (mounted) {
          setIsRefreshing(false);
        }
      }
    };

    // Set up periodic refresh (every hour)
    const refreshInterval = setInterval(handleBackgroundRefresh, 60 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    // Apply filters whenever search term or categories change
    let currentFiltered = kickstarts;

    // Search term filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFiltered = currentFiltered.filter(kickstart =>
        kickstart.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        kickstart.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        kickstart.categories.some(cat => cat.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    // Category filter - now supports multiple categories
    if (selectedCategories.length > 0) {
      currentFiltered = currentFiltered.filter(kickstart =>
        selectedCategories.some(selectedCat =>
          kickstart.categories.includes(selectedCat)
        )
      );
    }

    setFilteredKickstarts(currentFiltered);
  }, [searchTerm, selectedCategories, kickstarts]);

  const onCategorySelectToggle = (isOpen) => {
    setIsCategorySelectOpen(isOpen);
  };

  const onCategorySelect = (category) => {
    setSelectedCategories(prev => {
      if (category === 'All Categories') {
        return [];
      }
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      }
      return [...prev, category];
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
  };

  // Add effect to fetch repo stats
  useEffect(() => {
    const loadRepoStats = async () => {
      const stats = await fetchRepoStats();
      setRepoStats(stats);
    };
    loadRepoStats();
  }, []);

  return (
    <>
      {/* Inject custom CSS for PatternFly look-alike */}
      <style>{customPatternFlyStyle}</style>

      {/* Main Page Layout using div elements */}
      <div className="pf-v5-c-page">
        {/* Masthead */}
        <header className="pf-v5-c-masthead">
          <div className="pf-v5-c-masthead__main">
            <div className="pf-v5-c-masthead__brand">
              <a className="pf-v5-c-brand" href="/">
                <img
                  src={`${BASE_PATH}/assets/logo.svg`}
                  alt="Red Hat Fedora Logo"
                  style={{
                    height: '40px',
                    width: 'auto',
                    marginRight: 'var(--pf-global--spacer--md)'
                  }}
                />
                <span className="pf-v5-u-font-weight-bold pf-v5-u-font-size-2xl" style={{ color: 'white' }}>Red Hat</span>
                <span className="pf-v5-u-font-size-xl pf-v5-u-ml-sm" style={{ color: 'white' }}>AI Kickstarts</span>
              </a>
            </div>
          </div>
          <div className="pf-v5-c-masthead__content">
            {/* Additional header content can go here */}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="pf-v5-c-page__main">
          {/* Hero Section / Introduction */}
          <section className="pf-v5-c-page__main-section pf-m-light pf-v5-u-py-xl">
            <div className="pf-v5-u-text-align-center pf-v5-u-pb-lg">
              <h1 className="pf-v5-c-title">Explore Red Hat AI Kickstarts - v02</h1>
              <p className="pf-v5-u-mt-md">
                Discover ready-to-run AI examples designed for Red Hat OpenShift AI.
                {isRefreshing && (
                  <span style={{ marginLeft: 'var(--pf-global--spacer--sm)', fontSize: 'var(--pf-global--FontSize--sm)', color: 'var(--pf-global--Color--200)' }}>
                    (Refreshing data...)
                  </span>
                )}
              </p>
            </div>

            {/* Toolbar for Search and Filter */}
            <div className="pf-v5-c-toolbar pf-v5-u-mb-lg">
              <div className="pf-v5-c-toolbar__content">
                <div className="pf-v5-c-toolbar__item">
                  <div className="pf-v5-c-text-input-group">
                    <input
                      className="pf-v5-c-text-input-group__text-input"
                      type="search"
                      aria-label="Search kickstarts"
                      placeholder="Search by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="pf-v5-c-button pf-m-control" aria-label="Search button">
                      <svg fill="currentColor" height="1em" width="1em" viewBox="0 0 512 512" aria-hidden="true" role="img" style={{ verticalAlign: '-0.125em' }}>
                        <path d="M416 208c0 45.9-14.9 88.3-40 122.7L476 438.7c3.1 3.1 4.7 7.2 4.7 11.3 0 4.1-1.6 8.2-4.7 11.3l-22.6 22.6c-3.1 3.1-7.2 4.7-11.3 4.7-4.1 0-8.2-1.6-11.3-4.7L339.3 360c-34.4 25.1-76.8 40-122.7 40C93.1 400 0 306.9 0 208S93.1 16 208 16s208 93.1 208 192zM208 64c-77.9 0-141 63.1-141 141s63.1 141 141 141 141-63.1 141-141-63.1-141-141-141z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="pf-v5-c-toolbar__item">
                  <div className="pf-v5-c-select">
                    <button
                      className="pf-v5-c-select__toggle"
                      onClick={() => onCategorySelectToggle(!isCategorySelectOpen)}
                      aria-expanded={isCategorySelectOpen}
                    >
                      <span>
                        {selectedCategories.length > 0
                          ? `${selectedCategories.length} categories selected`
                          : 'Filter by Category'}
                      </span>
                      <span className="pf-v5-c-select__toggle-arrow">
                        &#9660;
                      </span>
                    </button>
                    {isCategorySelectOpen && (
                      <ul className="pf-v5-c-select__menu">
                        <li
                          className="pf-v5-c-select__menu-item"
                          onClick={() => {
                            setSelectedCategories([]);
                            setIsCategorySelectOpen(false);
                          }}
                        >
                          Clear Categories
                        </li>
                        {categories.map((category, index) => (
                          <li
                            key={index}
                            className={`pf-v5-c-select__menu-item ${selectedCategories.includes(category) ? 'pf-m-selected' : ''}`}
                            onClick={() => onCategorySelect(category)}
                          >
                            {category}
                            {selectedCategories.includes(category) && (
                              <span style={{ marginLeft: 'var(--pf-global--spacer--sm)' }}>✓</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                {(searchTerm || selectedCategories.length > 0) && (
                  <div className="pf-v5-c-toolbar__item">
                    <button
                      className="pf-v5-c-button pf-m-secondary"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
              {/* Selected Categories Display */}
              {selectedCategories.length > 0 && (
                <div style={{
                  marginTop: 'var(--pf-global--spacer--md)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--pf-global--spacer--sm)'
                }}>
                  {selectedCategories.map((category, index) => (
                    <span
                      key={index}
                      className="pf-v5-c-label pf-m-outline pf-m-blue"
                      style={{ cursor: 'pointer' }}
                      onClick={() => onCategorySelect(category)}
                    >
                      {category} ×
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Kickstarts Gallery */}
          <section className="pf-v5-c-page__main-section">
            {isLoading ? (
              <div className="pf-v5-c-empty-state">
                <div className="pf-v5-c-empty-state__icon">
                  <div className="pf-v5-c-spinner" role="progressbar" aria-label="Loading..."></div>
                </div>
                <h2 className="pf-v5-c-title pf-m-xl">Loading Kickstarts...</h2>
                <div className="pf-v5-c-empty-state__body">
                  Fetching the latest AI kickstart projects from GitHub.
                </div>
              </div>
            ) : error ? (
              <div className="pf-v5-c-empty-state">
                <div className="pf-v5-c-empty-state__icon">
                  <svg fill="currentColor" height="3em" width="3em" viewBox="0 0 512 512" aria-hidden="true" role="img">
                    <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
                  </svg>
                </div>
                <h2 className="pf-v5-c-title pf-m-xl">Error Loading Kickstarts</h2>
                <div className="pf-v5-c-empty-state__body">
                  {error}
                </div>
                <button
                  className="pf-v5-c-button pf-m-primary"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            ) : filteredKickstarts.length > 0 ? (
              <div className="pf-v5-c-gallery">
                {filteredKickstarts.map(kickstart => (
                  <KickstartCard key={kickstart.id} kickstart={kickstart} />
                ))}
              </div>
            ) : (
              <div className="pf-v5-c-empty-state">
                <div className="pf-v5-c-empty-state__icon">
                  <svg fill="currentColor" height="3em" width="3em" viewBox="0 0 512 512" aria-hidden="true" role="img">
                    <path d="M472 0H40C17.9 0 0 17.9 0 40v304c0 22.1 17.9 40 40 40h128l48 96 48-96h128c22.1 0 40-17.9 40-40V40c0-22.1-17.9-40-40-40zm-80 304h-96V208h96v96zM128 104c0-22.1 17.9-40 40-40h176c22.1 0 40 17.9 40 40v96H128v-96zm256 128h-96v96h96v-96zM128 304v-96h96v96h-96z"/>
                  </svg>
                </div>
                <h2 className="pf-v5-c-title pf-m-xl">No Kickstarts Found</h2>
                <div className="pf-v5-c-empty-state__body">
                  Adjust your search or filter criteria to find more kickstarts.
                </div>
              </div>
            )}
          </section>
        </main>

        {/* Add Footer */}
        <footer className="pf-v5-c-footer">
          <div className="pf-v5-c-footer__content">
            <div className="pf-v5-c-footer__text">
              PoC App by <a href="https://red.ht/cai-team" className="pf-v5-c-footer__link" target="_blank" rel="noopener noreferrer">red.ht/cai-team</a>
            </div>
            <div className="pf-v5-c-footer__stats">
              <a href={repoStats.url} className="pf-v5-c-footer__link" target="_blank" rel="noopener noreferrer">
                <span className="pf-v5-c-footer__stat">
                  <svg className="pf-v5-c-footer__stat-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 .25a.75.75 0 0 1 .673.418l3.058 6.197 6.839.994a.75.75 0 0 1 .415 1.279l-4.948 4.823 1.168 6.811a.75.75 0 0 1-1.088.791L8 13.347l-6.116 3.216a.75.75 0 0 1-1.088-.79l1.168-6.812-4.948-4.823a.75.75 0 0 1 .416-1.28l6.838-.993L7.327.668A.75.75 0 0 1 8 .25z"/>
                  </svg>
                  {repoStats.stars}
                </span>
                <span className="pf-v5-c-footer__stat">
                  <svg className="pf-v5-c-footer__stat-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h1.5v2.128a2.251 2.251 0 1 0 1.5 0V8.5h1.5a2.25 2.25 0 0 0 2.25-2.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 6.25v-.878zm3.75 7.378a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm3-8.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z"/>
                  </svg>
                  {repoStats.forks}
                </span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default App;
