import { Module } from '@nestjs/common';
import { ConnectionGateway } from './connection.gateway';
import { CommonService } from 'src/common/common.service';

@Module({
  providers: [ConnectionGateway , CommonService],
  exports: [ConnectionGateway], // 👈 Export the gateway
})
export class GatewayModule {}