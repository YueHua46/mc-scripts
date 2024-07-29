import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { openServerMenuForm } from '../Forms/Forms';
import { useGetAllPlayer } from '../../hooks/hooks';
import { color } from '../../utils/color';
// 创建传送请求表单
function createRequestTpaForm(title, requestPlayer, targetPlayer, type) {
  const form = new ActionFormData();
  form.title(title);
  form.body({
    rawtext: [
      {
        text:
          type === 'to'
            ? `${color.green('玩家')} ${color.yellow(requestPlayer.name)} ${color.green('请求传送到你的旁边\n')}`
            : `${color.green('玩家')} ${color.yellow(requestPlayer.name)} ${color.green('请求你传送到他的旁边\n')}`,
      },
      {
        text: `${color.green('是否接受?')}`,
      },
    ],
  });
  form.button('接受', 'textures/ui/realms_green_check');
  form.button('拒绝', 'textures/ui/realms_red_x');
  return form;
}
function teleportPlayer(requestPlayer, targetPlayer, type) {
  if (type === 'to') {
    requestPlayer.teleport(targetPlayer.location, {
      dimension: targetPlayer.dimension,
    });
    requestPlayer.sendMessage(
      `${color.green('你已')}${color.green('传送到')} ${color.yellow(targetPlayer.name)} ${color.green('的旁边')}`,
    );
    targetPlayer.sendMessage(
      `${color.green('玩家')} ${color.yellow(requestPlayer.name)} ${color.green('已传送到你的旁边')}`,
    );
  } else {
    targetPlayer.teleport(requestPlayer.location, {
      dimension: requestPlayer.dimension,
    });
    requestPlayer.sendMessage(
      `${color.green('你已')}${color.green('传送到')} ${color.yellow(targetPlayer.name)} ${color.green('的旁边')}`,
    );
    targetPlayer.sendMessage(
      `${color.green('玩家')} ${color.yellow(requestPlayer.name)} ${color.green('已传送到你的旁边')}`,
    );
  }
}
export function openRequestTpaForm(requestPlayer, targetPlayer, type) {
  const title = `${'玩家传送请求'}`;
  const form = createRequestTpaForm(title, requestPlayer, targetPlayer, type);
  form.show(targetPlayer).then(data => {
    if (data.cancelationReason) {
      return requestPlayer.sendMessage(color.red('用户正处于其他UI界面！传送失败'));
    }
    switch (data.selection) {
      case 0:
        teleportPlayer(requestPlayer, targetPlayer, type);
        break;
      case 1:
        requestPlayer.sendMessage(
          `${color.red('玩家')} ${color.yellow(targetPlayer.name)} ${color.red('拒绝了你的传送请求')}`,
        );
        targetPlayer.sendMessage(
          `${color.red('你已')}${color.red('拒绝了')} ${color.yellow(requestPlayer.name)} ${color.red('的传送请求')}`,
        );
        break;
    }
  });
}
// 创建玩家传送表单
function createPlayerTpaForm(allPlayer) {
  const form = new ModalFormData();
  form.title(`${'玩家传送'}`);
  form.dropdown(
    '§w选择玩家',
    allPlayer.map(player => ` ${player.name}`),
  );
  form.dropdown('§w选择传送方式', ['§w传送到玩家', '§w请求玩家传送到你']);
  form.submitButton('§w确认');
  return form;
}
export function openPlayerTpaForm(player) {
  const allPlayer = useGetAllPlayer();
  const form = createPlayerTpaForm(allPlayer);
  form.show(player).then(data => {
    const { formValues } = data;
    if (formValues) {
      const targetPlayer = allPlayer[Number(formValues[0])];
      if (player.name === targetPlayer.name) {
        return player.sendMessage('§c不能传送到自己');
      }
      const type = Number(formValues[1]) === 0 ? 'to' : 'come';
      player.sendMessage(color.green('已发送传送请求'));
      openRequestTpaForm(player, targetPlayer, type);
    } else {
      player.sendMessage(color.red('传送请求失败'));
    }
  });
}
// 玩家操作
// 创建玩家操作表单
function createPlayerActionForm() {
  const form = new ActionFormData();
  form.title('§w玩家操作');
  form.button('§wTPA玩家传送', 'textures/ui/enable_editor');
  form.button('§w返回', 'textures/ui/dialog_bubble_point');
  return form;
}
// 打开玩家操作表单
export function openPlayerActionForm(player) {
  const form = createPlayerActionForm();
  form.show(player).then(data => {
    switch (data.selection) {
      case 0:
        openPlayerTpaForm(player);
        break;
      case 1:
        openServerMenuForm(player);
        break;
    }
  });
}
