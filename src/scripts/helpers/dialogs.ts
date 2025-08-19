import type InputDialog from '../components/dialogs/InputDialog';
import type ConfirmDialog from '../components/dialogs/ConfirmDialog';
import type { ConfirmDialogType } from '../components/dialogs/ConfirmDialog';

export interface ConfirmOptions {
  title: string;
  description?: string;
  submit?: string;
  cancel?: string;
  type?: ConfirmDialogType;
}
export type PromptOptions = ConfirmOptions & {
  value?: string;
};

const promptDialogId = 'prompt_dialog';
export function prompt({ value, ...options }: PromptOptions): Promise<string> {
  let dialog: InputDialog = document.querySelector(`#${promptDialogId}`);
  if (!dialog) {
    dialog = document.createElement('input-dialog') as InputDialog;
    dialog.id = promptDialogId;
    document.body.appendChild(dialog);
  }

  ['title', 'description', 'submit', 'cancel', 'type'].forEach(attr => {
    if (options[attr] != null && options[attr] !== '') {
      dialog.setAttribute(attr, options[attr]);
    } else {
      dialog.removeAttribute(attr);
    }
  });

  return dialog.show(value);
}

const CONFIRM_DIALOG_ID = 'confirm_dialog';

export function confirm(options: ConfirmOptions): Promise<void> {
  let dialog: ConfirmDialog = document.querySelector(`#${CONFIRM_DIALOG_ID}`);
  if (!dialog) {
    dialog = document.createElement('confirm-dialog') as ConfirmDialog;
    dialog.id = CONFIRM_DIALOG_ID;
    document.body.appendChild(dialog);
  }

  ['title', 'description', 'submit', 'cancel', 'type'].forEach(attr => {
    if (options[attr] != null && options[attr] !== '') {
      dialog.setAttribute(attr, options[attr]);
    } else {
      dialog.removeAttribute(attr);
    }
  });

  return dialog.show();
}
