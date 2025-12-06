import { GenerateTravelGuideInput } from '../types';

export function generateSystemPrompt(): string {
  return `Você é um assistente especializado em planejamento de viagens no Brasil.

Sua função é criar guias de viagem informativos, práticos e úteis para viajantes.

Diretrizes:
- Escreva em português brasileiro, de forma clara e acessível
- Seja objetivo e direto ao ponto
- Forneça informações úteis e práticas
- Use um tom amigável mas profissional
- Organize as informações de forma lógica
- Inclua dicas práticas quando relevante
- Sempre mencione custos em Reais (R$)

Formato esperado:
1. Introdução breve sobre a cidade (1-2 parágrafos)
2. Informações sobre clima (se disponível)
3. Estimativa de custos (se disponível)
4. Dicas práticas para o viajante (2-3 dicas)`;
}

export function generateUserPrompt(input: GenerateTravelGuideInput): string {
  const parts: string[] = [];

  parts.push(
    `Crie um guia de viagem para ${input.cityName}${input.state ? `, ${input.state}` : ''}, ${input.country}.`
  );

  if (input.cityInfo) {
    parts.push(`\n### Sobre a cidade:\n${input.cityInfo}`);
  }

  if (input.weather) {
    parts.push('\n### Clima:');

    if (input.weather.current) {
      const { temperature, condition, description, humidity } =
        input.weather.current;
      parts.push(
        `Clima atual: ${temperature}°C, ${condition}${description ? ` (${description})` : ''}`
      );
      if (humidity) {
        parts.push(`Umidade: ${humidity}%`);
      }
    }

    if (input.weather.forecast && input.weather.forecast.length > 0) {
      parts.push('\nPrevisão próximos dias:');
      input.weather.forecast.slice(0, 3).forEach((day) => {
        const dateStr = day.date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        });
        parts.push(`- ${dateStr}: ${day.temperature}°C, ${day.condition}`);
      });
    }

    if (input.weather.seasonal) {
      parts.push(
        `\nClima típico da estação (${input.weather.seasonal.season}): ${input.weather.seasonal.averageTemperature}°C em média`
      );
      if (input.weather.seasonal.description) {
        parts.push(input.weather.seasonal.description);
      }
    }
  }

  if (input.costs) {
    const currency = input.costs.currency || 'BRL';
    parts.push(`\n### Custos Estimados em ${currency}:`);

    if (input.costs.transport) {
      if (input.costs.transport.flight) {
        const { min, max } = input.costs.transport.flight;
        if (min && max) {
          parts.push(`Passagem aérea: R$ ${min} - R$ ${max}`);
        }
      }
      if (input.costs.transport.bus) {
        const { min, max } = input.costs.transport.bus;
        if (min && max) {
          parts.push(`Ônibus: R$ ${min} - R$ ${max}`);
        }
      }
    }

    if (input.costs.accommodation) {
      parts.push('\nHospedagem (por noite):');
      if (input.costs.accommodation.budget) {
        const { min, max } = input.costs.accommodation.budget;
        if (min && max) {
          parts.push(`- Econômica: R$ ${min} - R$ ${max}`);
        }
      }
      if (input.costs.accommodation.midRange) {
        const { min, max } = input.costs.accommodation.midRange;
        if (min && max) {
          parts.push(`- Intermediária: R$ ${min} - R$ ${max}`);
        }
      }
      if (input.costs.accommodation.luxury) {
        const { min, max } = input.costs.accommodation.luxury;
        if (min && max) {
          parts.push(`- Luxo: R$ ${min} - R$ ${max}`);
        }
      }
    }
  }

  if (input.travelInfo) {
    if (input.travelInfo.startDate && input.travelInfo.endDate) {
      const start = input.travelInfo.startDate.toLocaleDateString('pt-BR');
      const end = input.travelInfo.endDate.toLocaleDateString('pt-BR');
      parts.push(`\n### Período da viagem: ${start} a ${end}`);
    }
    if (input.travelInfo.numberOfNights) {
      parts.push(`Duração: ${input.travelInfo.numberOfNights} noite(s)`);
    }
    if (input.travelInfo.origin) {
      parts.push(`Origem: ${input.travelInfo.origin}`);
    }
  }

  return parts.join('\n');
}
