# acikek.com

This is the source repository for my website. In summary, this project runs a simple HTTP server with statically-generated content.

## Project Structure

### Infrastructure

- **`templates/`**: HTML pages and components with `$template` keys.
- **`styles/`**: stylesheets separated by page type for convenience. Combined into one file during initialization.
- **`src/`**: library code for reading files and generating content.
- **`index.js`**: main server entrypoint.

### Content

- **`updates/`**: website-related or general updates injected into the homepage and sorted by recency. Format: `YYYY-MM-DD.html` with arbitrary HTML content.
- **`projects/`**: metadata files used to generate cards on the projects page. Each entry is an arbitrarily-named JSON file with the following keys: `name`, `description`, `link`, and `thumbnail`.
- **`blogposts/`**: blogpost files used to generate both blogpost pages and entries in the blog page. Format: `YYYY-MM-DD_Post Title.html` with arbitrary HTML content.
    - JSON metadata can be included in a comment with the following keys: `summary` and `thumbnail`.
- **`tools.txt`**: newline-separated entries for the randomly-chosen *'Made with ...*' text in the footer.