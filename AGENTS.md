<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Module tables use the shared DataTable export configuration so CSV downloads follow the current filters across all pages.
- Optional form selectors map empty values to a UI sentinel and restore the empty value on submission because the select control rejects empty option values.
- URL-driven table filters reset to their defaults when parameters disappear, so back navigation never keeps a stale indicator filter; the synchronization lives in a pure tested helper.
- Application catalog exclusions are derived from URL search parameters, including manual choices, so browser history restores the exact catalog view without duplicated local state.
