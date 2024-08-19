<template>
  <VDialog
    v-if="showAboutDialog"
    :show="showAboutDialog"
    @close="closeAboutDialog"
  >
    <grid columns="3" class="about-dialog-text">
      <c span="3">
        <h1>genMDM Editor</h1>
        <span class="subtitle">version {{ version }} by 2xAA</span>
      </c>
      <c>
        <b
          >Like this software?<br /><br />Consider supporting the development of
          this and other projects by
          <a
            href="https://github.com/sponsors/2xAA"
            nofollow
            noreferrer
            target="_blank"
            >donating</a
          >
          or
          <a href="https://2xaa.net/" nofollow noreferrer target="_blank"
            >buying/streaming my music</a
          >.</b
        ><br /><br />

        Need some help?<br /><br />Check out
        <a
          href="https://github.com/2xAA/genmdm-editor/discussions"
          nofollow
          noreferrer
          target="_blank"
          >Discussions</a
        >
        for an answer to your question.<br /><br />
        Found a bug or would like to suggest an improvement?<br />
        <a
          href="https://github.com/2xAA/genmdm-editor/issues/new/choose"
          nofollow
          noreferrer
          target="_blank"
          >Create an issue on GitHub</a
        >.</c
      >
      <c>
        I created this editor to further the genMDM and MDMI's usability and to
        understand the Sega MD's capabilities. I hope you find this useful.<br /><br />

        This editor's design was inspired by the scan of the Japanese technical
        documentation of the YM2608, which is said to be the closest
        documentation to the Sega Mega Drive's YM2612 as they share the same FM
        package.
      </c>
      <c>
        Special thanks to catskull, Robert Hargreaves, and littlescale for the
        genMDM itself.<br /><br />
        Greetz to: {{ friends }} and all chippers and genMDM users around the
        world.<br /><br />ALWAYS BACK UP YOUR SAVES.
      </c>
    </grid>
  </VDialog>
</template>

<script>
import pkg from "../../../../package.json";
import VDialog from "./Dialog.vue";
import shuffle from "../utils/shuffle";

export default {
  components: {
    VDialog,
  },

  data() {
    return {
      version: pkg.version,

      friendsNames: [
        "Mum",
        "James",
        "Nic",
        "Li",
        "NERDDISCO",
        "Lazer Sausage",
        "cTrix",
        "Infotoxin",
        "Henry Homesweet",
        "Leon",
        "Jamatar",
        "gwEm",
        "Cyanide Dansen",
        "Polyop",
        "jonic",
      ],
    };
  },

  computed: {
    friends() {
      // expression using this.showAboutDialog makes Vue run the shuffle
      // function each time this.showAboutDialog updates :)
      return this.showAboutDialog && shuffle(this.friendsNames).join(", ");
    },

    showAboutDialog: {
      get() {
        return this.$store.state.showAboutDialog;
      },

      set(value) {
        this.$store.commit("SET_SHOWABOUTDIALOG", value);
      },
    },
  },

  methods: {
    closeAboutDialog() {
      this.showAboutDialog = false;
    },
  },
};
</script>
