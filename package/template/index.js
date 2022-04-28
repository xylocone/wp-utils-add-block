import { registerBlockType } from "@wordpress/blocks";

registerBlockType("{{ slug }}/{{ blockName }}", {
  edit: function () {
    return <p> {{ title }} says, "Hello World from the Editor!" </p>;
  },
  save: function () {
    return <p> {{ title }} says, "Hello World form the Frontend!" </p>;
  },
});
