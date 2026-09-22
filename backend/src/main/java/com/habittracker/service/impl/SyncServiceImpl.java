package com.habittracker.service.impl;

import com.habittracker.dto.HabitResponseDto;
import com.habittracker.dto.SyncBatchRequestDto;
import com.habittracker.dto.SyncBatchResponseDto;
import com.habittracker.dto.SyncOperationDto;
import com.habittracker.service.HabitService;
import com.habittracker.service.SyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class SyncServiceImpl implements SyncService {

    private static final Logger log = LoggerFactory.getLogger(SyncServiceImpl.class);

    private final HabitService habitService;

    public SyncServiceImpl(HabitService habitService) {
        this.habitService = habitService;
    }

    @Override
    public SyncBatchResponseDto processBatchSync(Long userId, SyncBatchRequestDto batchRequest) {
        if (batchRequest == null || batchRequest.getOperations() == null || batchRequest.getOperations().isEmpty()) {
            return new SyncBatchResponseDto(true, 0, new HashMap<>(), "No operations to synchronize");
        }

        Map<String, Long> idMappings = new HashMap<>();
        int replayedCount = 0;

        for (SyncOperationDto op : batchRequest.getOperations()) {
            if (op == null || op.getType() == null) continue;

            try {
                switch (op.getType().toUpperCase()) {
                    case "CREATE_HABIT": {
                        if (op.getHabitData() != null) {
                            HabitResponseDto created = habitService.createHabit(userId, op.getHabitData());
                            if (op.getTempId() != null) {
                                idMappings.put(op.getTempId(), created.getId());
                            }
                            replayedCount++;
                        }
                        break;
                    }

                    case "COMPLETE_HABIT": {
                        Long targetId = resolveHabitId(op, idMappings);
                        if (targetId != null) {
                            LocalDate date = op.getDate() != null ? op.getDate() : LocalDate.now();
                            habitService.completeHabit(targetId, userId, date);
                            replayedCount++;
                        }
                        break;
                    }

                    case "UNCOMPLETE_HABIT": {
                        Long targetId = resolveHabitId(op, idMappings);
                        if (targetId != null) {
                            LocalDate date = op.getDate() != null ? op.getDate() : LocalDate.now();
                            habitService.uncompleteHabit(targetId, userId, date);
                            replayedCount++;
                        }
                        break;
                    }

                    case "EDIT_HABIT": {
                        Long targetId = resolveHabitId(op, idMappings);
                        if (targetId != null && op.getHabitData() != null) {
                            habitService.updateHabit(targetId, userId, op.getHabitData());
                            replayedCount++;
                        }
                        break;
                    }

                    case "DELETE_HABIT": {
                        Long targetId = resolveHabitId(op, idMappings);
                        if (targetId != null) {
                            habitService.deleteHabit(targetId, userId);
                            replayedCount++;
                        }
                        break;
                    }

                    default:
                        log.warn("Unknown sync operation type: {}", op.getType());
                }
            } catch (Exception e) {
                log.error("Failed to replay sync operation: {} for user: {}", op.getType(), userId, e);
                // Continue with next operations so queue does not stall
            }
        }

        return new SyncBatchResponseDto(
                true,
                replayedCount,
                idMappings,
                "Successfully synchronized " + replayedCount + " offline operations"
        );
    }

    private Long resolveHabitId(SyncOperationDto op, Map<String, Long> idMappings) {
        if (op.getTempId() != null && idMappings.containsKey(op.getTempId())) {
            return idMappings.get(op.getTempId());
        }
        if (op.getHabitId() != null) {
            // Also check if habitId as string was in idMappings
            String key = String.valueOf(op.getHabitId());
            if (idMappings.containsKey(key)) {
                return idMappings.get(key);
            }
            return op.getHabitId();
        }
        return null;
    }
}
