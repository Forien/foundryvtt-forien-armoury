
import {constants} from "../constants.mjs";

export default class FatigueChannelTest extends ChannelTest {

    async runPostEffects() {
        await game.modules.get(constants.moduleId).api.castingFatigue.processRollChannelTest(this, {});
        await super.runPostEffects();
      }
}