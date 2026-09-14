// `@var-ui/core/styles` is empty in 0.1.0 (`vp pack` dropped its side-effect
// imports). Register the same graph via the subpaths that actually emit CSS.
import "@var-ui/core";
import "@var-ui/core/base-styles";
import "@var-ui/core/components/styles";
import "@var-ui/core/hidden";
import "@var-ui/core/register-default-theme";
import "@homeslate/widgets/styles";
import "@homeslate/display/styles";
import "@homeslate/editor/styles";
