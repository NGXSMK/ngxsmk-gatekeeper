
import { Provider, APP_INITIALIZER } from '@angular/core';
import { GatekeeperAgentService } from './gatekeeper-agent.service';
import { AgentConfig, AGENT_CONFIG } from './agent.types';

export * from './agent.types';
export * from './gatekeeper-agent.service';

export function provideGatekeeperAgent(config?: AgentConfig): Provider[] {
    return [
        GatekeeperAgentService,
        {
            provide: AGENT_CONFIG,
            useValue: config
        },
        {
            provide: APP_INITIALIZER,
            useFactory: (agent: GatekeeperAgentService) => () => agent.start(),
            deps: [GatekeeperAgentService],
            multi: true
        }
    ];
}
