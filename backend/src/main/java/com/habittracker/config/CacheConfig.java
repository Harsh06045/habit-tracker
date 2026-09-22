package com.habittracker.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class CacheConfig implements CachingConfigurer {

    private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

    public static final String CACHE_STATS_TODAY = "stats_today";
    public static final String CACHE_STATS_WEEK = "stats_week";
    public static final String CACHE_STATS_MONTH = "stats_month";
    public static final String CACHE_STATS_HABIT = "stats_habit";
    public static final String CACHE_USER_HABITS = "user_habits";
    public static final String CACHE_GAMIFICATION = "gamification_profile";

    /**
     * Redis Cache Manager - active when spring.cache.type=redis (e.g. in Docker/Production)
     */
    @Bean
    @ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis")
    public RedisCacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .disableCachingNullValues()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));

        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        // 10 minute TTL for aggregated statistics
        cacheConfigurations.put(CACHE_STATS_TODAY, defaultConfig.entryTtl(Duration.ofMinutes(10)));
        cacheConfigurations.put(CACHE_STATS_WEEK, defaultConfig.entryTtl(Duration.ofMinutes(10)));
        cacheConfigurations.put(CACHE_STATS_MONTH, defaultConfig.entryTtl(Duration.ofMinutes(10)));
        cacheConfigurations.put(CACHE_STATS_HABIT, defaultConfig.entryTtl(Duration.ofMinutes(10)));

        // 5 minute TTL for frequently accessed user habits & gamification
        cacheConfigurations.put(CACHE_USER_HABITS, defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigurations.put(CACHE_GAMIFICATION, defaultConfig.entryTtl(Duration.ofMinutes(5)));

        log.info("Initialized RedisCacheManager with cache-aside configurations and TTLs");
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
    }

    /**
     * In-memory Cache Manager - default for dev/testing when Redis is not active
     */
    @Bean
    @org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean(RedisCacheManager.class)
    public CacheManager inMemoryCacheManager() {
        log.info("Initializing in-memory CacheManager for development & test profiles");
        return new ConcurrentMapCacheManager(
                CACHE_STATS_TODAY,
                CACHE_STATS_WEEK,
                CACHE_STATS_MONTH,
                CACHE_STATS_HABIT,
                CACHE_USER_HABITS,
                CACHE_GAMIFICATION
        );
    }

    /**
     * Resilient cache error handling: if cache server goes down, transparently fall back to database
     */
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Cache GET failed for cache: {}, key: {}. Falling back to DB.", cache.getName(), key, exception);
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn("Cache PUT failed for cache: {}, key: {}.", cache.getName(), key, exception);
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Cache EVICT failed for cache: {}, key: {}.", cache.getName(), key, exception);
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn("Cache CLEAR failed for cache: {}.", cache.getName(), exception);
            }
        };
    }
}
