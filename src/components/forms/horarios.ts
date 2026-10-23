// Linha com Horário de início e término do evento, compartilhada pelos LeadForms das páginas.
// Máscara hh:mm aplicada pelo horaMask de cada script de página; o pattern valida 00:00 → 23:59.

const HORA_PATTERN = '([01]\\d|2[0-3]):[0-5]\\d';

export const horarioRow = {
  type: 'row' as const,
  fields: [
    {
      name: 'form_fields[horario_inicio]', id: 'HorarioInicio', type: 'text' as const, label: 'Horário de início', placeholder: '00:00',
      inputmode: 'numeric', pattern: HORA_PATTERN, autocomplete: 'off', maxlength: 5, required: true,
      errorText: 'Informe o horário de início (hh:mm).', errorId: 'errHorarioInicio',
    },
    {
      name: 'form_fields[horario_termino]', id: 'HorarioTermino', type: 'text' as const, label: 'Horário de término', placeholder: '00:00',
      inputmode: 'numeric', pattern: HORA_PATTERN, autocomplete: 'off', maxlength: 5, required: true,
      errorText: 'Informe o horário de término (hh:mm).', errorId: 'errHorarioTermino',
    },
  ],
};
