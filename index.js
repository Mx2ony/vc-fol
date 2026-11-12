import { findByProps, findByStoreName } from "@vendetta/metro";
import { FluxDispatcher, React } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { showToast } from "@vendetta/ui/toasts";
import { Forms } from "@vendetta/ui/components";

const { FormInput, FormRow, FormSection, FormDivider } = Forms;
const { selectVoiceChannel } = findByProps("selectVoiceChannel") || {};
const UserStore = findByStoreName("UserStore");

let voiceListener = null;

function getFollowedId() {
  return storage.followedUserId || "";
}

function setFollowedId(id) {
  storage.followedUserId = id?.trim() || "";
}

function handleVoiceUpdate(payload) {
  const followedId = getFollowedId();
  if (!followedId || !selectVoiceChannel) return;

  const states = payload?.voiceStates || [];
  for (const state of states) {
    if (state.userId === followedId && state.channelId) {
      try {
        selectVoiceChannel(state.channelId);
        showToast("Joined voice with followed user");
      } catch (e) {
        console.log("[VoiceFollow] Error joining:", e);
      }
    }
  }
}

export default {
  onLoad() {
    voiceListener = (data) => handleVoiceUpdate(data);
    FluxDispatcher.subscribe("VOICE_STATE_UPDATES", voiceListener);
  },

  onUnload() {
    if (voiceListener) {
      FluxDispatcher.unsubscribe("VOICE_STATE_UPDATES", voiceListener);
      voiceListener = null;
    }
  },

  settings: () => {
    const [userId, setUserId] = React.useState(getFollowedId());

    return (
      <>
        <FormSection title="Voice Follow Settings">
          <FormInput
            title="User ID"
            placeholder="حط هنا آي دي الشخص"
            value={userId}
            onChange={(v) => setUserId(v)}
          />
          <FormRow
            label="حفظ ومتابعة"
            onPress={() => {
              setFollowedId(userId);
              showToast(userId ? "تم تفعيل المتابعة" : "تم إيقاف المتابعة");
            }}
          />
          <FormDivider />
          <FormRow
            label="إيقاف المتابعة"
            onPress={() => {
              setUserId("");
              setFollowedId("");
              showToast("تم إيقاف المتابعة");
            }}
          />
        </FormSection>
      </>
    );
  }
};